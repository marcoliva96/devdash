import { v4 as uuidv4 } from 'uuid';
import * as github from './githubService';
import * as storage from './storageService';

const LOCAL_SERVER = 'http://localhost:3002';

/**
 * Scan local filesystem via Express backend
 */
export async function scanLocalFolder(directoryPath) {
    try {
        const res = await fetch(`${LOCAL_SERVER}/api/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ directoryPath }),
        });
        if (!res.ok) throw new Error('Failed to scan folder');
        const data = await res.json();
        return data.projects || [];
    } catch (err) {
        console.warn('Local server not available:', err.message);
        return [];
    }
}

/**
 * Sync GitHub repos with local DB.
 * Returns { newRepos: string[], updatedProjects: Project[] }
 */
export async function syncGitHub(username) {
    const githubRepos = await github.fetchAllRepos(username);
    const existingProjects = await storage.getAllProjects();

    const existingByGithubName = {};
    for (const p of existingProjects) {
        if (p.githubRepoName) {
            existingByGithubName[p.githubRepoName.toLowerCase()] = p;
        }
    }

    const newRepos = [];
    const updatedProjects = [...existingProjects];

    for (const repo of githubRepos) {
        const key = repo.name.toLowerCase();
        if (existingByGithubName[key]) {
            // Update existing
            const project = existingByGithubName[key];
            project.isOnGithub = true;
            project.isPublic = !repo.isPrivate;
            project.isFork = repo.isFork;
            project.githubUrl = repo.htmlUrl;
            project.githubDescription = repo.description;
            if (repo.homepage) {
                project.deployUrl = repo.homepage;
                // Auto-screenshot if not already set or if we want to force update (optional, but let's keep existing if valid)
                // For now, let's update if it adheres to microurl pattern or is empty
                if (!project.imageUrl || project.imageUrl.includes('microlink.io')) {
                    project.imageUrl = `https://api.microlink.io/?url=${encodeURIComponent(repo.homepage)}&screenshot=true&meta=false&embed=screenshot.url`;
                }
            }
            project.languages = {};
            project.lastGithubSync = new Date().toISOString();
            project.githubTopics = repo.topics;
            project.githubLanguage = repo.language;
            project.githubCreatedAt = repo.createdAt;
            project.githubUpdatedAt = repo.updatedAt;
        } else {
            // New repo
            const maxOrder = updatedProjects.reduce((max, p) => Math.max(max, p.sortOrder || 0), 0);
            const newProject = {
                id: uuidv4(),
                name: repo.name,
                description: '',
                deployUrl: repo.homepage || null,
                imageUrl: repo.homepage ? `https://api.microlink.io/?url=${encodeURIComponent(repo.homepage)}&screenshot=true&meta=false&embed=screenshot.url` : null,
                githubUrl: repo.htmlUrl,
                githubRepoName: repo.name,
                localPath: null,
                isOnGithub: true,
                isPublic: !repo.isPrivate,
                isFork: repo.isFork,
                scope: '',
                tags: [],
                techStack: repo.language ? [repo.language] : [],
                projectType: '',
                capabilities: [],
                groupId: null,
                sortOrder: maxOrder + 1,
                lastGithubSync: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                commitHistory: [],
                languages: {},
                githubDescription: repo.description,
                githubTopics: repo.topics,
                githubLanguage: repo.language,
                githubCreatedAt: repo.createdAt,
                githubUpdatedAt: repo.updatedAt,
                isNew: true,
            };
            updatedProjects.push(newProject);
            newRepos.push(repo.name);
        }
    }

    // Save all
    await storage.saveAllProjects(updatedProjects);
    await storage.setAppState('lastSyncDate', new Date().toISOString());

    return { newRepos, updatedProjects };
}

/**
 * Cross-reference local folders with GitHub.
 * Returns updated projects list with local paths matched.
 */
export async function syncLocalFolder(directoryPath) {
    const localProjects = await scanLocalFolder(directoryPath);
    if (localProjects.length === 0) return [];

    const existingProjects = await storage.getAllProjects();
    // 2. Check by name (case-insensitive)
    const existingByName = {};
    for (const p of existingProjects) {
        existingByName[p.name.toLowerCase()] = p;
    }

    const unmatched = [];

    for (const local of localProjects) {
        const key = local.name.toLowerCase();

        // Try to match by remote URL/repo name first if available
        let project = null;
        if (local.hasGit && local.remoteUrl) {
            const repoName = extractRepoName(local.remoteUrl);
            if (repoName) {
                project = existingProjects.find(p =>
                    (p.githubRepoName && p.githubRepoName.toLowerCase() === repoName.toLowerCase()) ||
                    (p.githubUrl === local.remoteUrl)
                );
            }
        }

        // If not found by git info, try by name
        if (!project) {
            project = existingByName[key];
        }

        if (project) {
            // Match found — update local path
            project.localPath = local.localPath;
            if (!project.isOnGithub && local.hasGit && local.remoteUrl) {
                project.isOnGithub = true;
                project.githubUrl = local.remoteUrl;
                project.githubRepoName = extractRepoName(local.remoteUrl);
            }
            await storage.saveProject(project);
        } else {
            // Local project not in DB
            const maxOrder = existingProjects.reduce((max, p) => Math.max(max, p.sortOrder || 0), 0);
            const newProject = {
                id: uuidv4(),
                name: local.name,
                description: '',
                githubUrl: local.remoteUrl,
                githubRepoName: local.hasGit && local.remoteUrl ? extractRepoName(local.remoteUrl) : null,
                localPath: local.localPath,
                isOnGithub: !!(local.hasGit && local.remoteUrl),
                isPublic: null,
                isFork: false,
                scope: '',
                techStack: [],
                projectType: '',
                capabilities: [],
                groupId: null,
                sortOrder: maxOrder + unmatched.length + 1,
                lastGithubSync: null,
                createdAt: new Date().toISOString(),
                commitHistory: [],
                languages: {},
                isNew: true,
                localOnly: !local.hasGit || !local.remoteUrl,
                // New boolean flags
                check_pc: null,
                check_responsive: null,
                check_android: null,
                check_ios: null,
                check_vercel: null,
                check_multiusuario: null,
                check_publico: null,
            };
            await storage.saveProject(newProject);
            unmatched.push(newProject);
        }
    }

    return unmatched;
}

function extractRepoName(url) {
    if (!url) return null;
    const match = url.match(/github\.com[:/][\w-]+\/([\w.-]+?)(?:\.git)?$/);
    return match ? match[1] : null;
}
