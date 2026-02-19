import { Octokit } from '@octokit/rest';

let authToken = null;
const API_BASE = '/api';

export function initGitHub(token) {
    console.log('Initializing App Auth with token');
    authToken = token;
}

export async function fetchAllRepos(username) {
    if (!authToken) throw new Error('Not authenticated.');

    console.log('Fetching repos via proxy for user:', username);

    try {
        const response = await fetch(`${API_BASE}/github/repos?username=${username}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.repos;
    } catch (error) {
        console.error('Failed to fetch repos:', error);
        throw error;
    }
}

// These are less critical for now or can be implemented similarly later
// For now, returning empty/default to avoid breaking the app structure
export async function fetchRepoLanguages(owner, repo) {
    return {};
}

export async function fetchCommits(owner, repo, perPage = 100) {
    return [];
}

export async function validateToken() {
    // Simple validation: check if we can fetch repos
    try {
        await fetchAllRepos('marcoliva96'); // efficient enough check?
        return true;
    } catch {
        return false;
    }
}

export async function getAuthenticatedUser() {
    // We are "oli", hardcoded in backend for now.
    // If we wanted real profile, we'd need an endpoint for it.
    return { login: 'marcoliva96', name: 'Marc Oliva', avatarUrl: '' };
}
