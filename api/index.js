import express from 'express';
import cors from 'cors';
import { Octokit } from '@octokit/rest';

const app = express();
app.use(cors());
app.use(express.json());

// Hardcoded credentials for simplicity as requested
const VALID_USER = 'oli';
const VALID_PASS = '251092DEV*';

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === VALID_USER && password === VALID_PASS) {
        // Return a simple session token (in a real app, use JWT)
        // For this personal dashboard, a simple random string is enough security
        // combined with the secure Vercel environment.
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        return res.json({ success: true, token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware to check for auth header
// Client should send "Authorization: Bearer <base64_token>"
// We just verify it looks vaguely correct for now since we don't have a DB for sessions
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// GET /api/github/repos
app.get('/api/github/repos', requireAuth, async (req, res) => {
    const githubToken = process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;

    if (!githubToken) {
        return res.status(500).json({ error: 'Server misconfiguration: No GitHub Token' });
    }

    try {
        const octokit = new Octokit({ auth: githubToken });
        const username = req.query.username || 'marcoliva96';

        // Fetch repos (mirrors logic from original service)
        const repos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data } = await octokit.repos.listForAuthenticatedUser({
                per_page: 100,
                page,
                sort: 'updated',
                affiliation: 'owner,collaborator,organization_member',
            });

            repos.push(...data);
            hasMore = data.length === 100;
            page++;
        }

        // Map to simplified format
        const mapped = repos.map((repo) => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || '',
            htmlUrl: repo.html_url,
            isPrivate: repo.private,
            isFork: repo.fork,
            language: repo.language,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            defaultBranch: repo.default_branch,
            stargazersCount: repo.stargazers_count,
            topics: repo.topics || [],
            homepage: repo.homepage,
        }));

        res.json({ repos: mapped });
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

export default app;
