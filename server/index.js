import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Scan a directory for project folders
app.post('/api/scan', (req, res) => {
  const { directoryPath } = req.body;

  if (!directoryPath) {
    return res.status(400).json({ error: 'directoryPath is required' });
  }

  try {
    if (!fs.existsSync(directoryPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const fullPath = path.join(directoryPath, entry.name);
        const gitPath = path.join(fullPath, '.git');
        const hasGit = fs.existsSync(gitPath);

        let remoteUrl = null;
        if (hasGit) {
          try {
            remoteUrl = execSync('git remote get-url origin', {
              cwd: fullPath,
              encoding: 'utf-8',
              timeout: 5000
            }).trim();
          } catch {
            // No remote configured
          }
        }

        // Get last modified date
        const stats = fs.statSync(fullPath);

        projects.push({
          name: entry.name,
          localPath: fullPath,
          hasGit,
          remoteUrl,
          lastModified: stats.mtime.toISOString()
        });
      }
    }

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DevDash server running on http://localhost:${PORT}`);
});
