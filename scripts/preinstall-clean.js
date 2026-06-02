const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const workspaceDirs = ['backend', 'frontend'];

const hasPnpmArtifacts = workspaceDirs.some((dir) => fs.existsSync(path.join(workspaceRoot, dir, 'node_modules', '.pnpm')));

if (!hasPnpmArtifacts) {
  process.exit(0);
}

for (const dir of workspaceDirs) {
  const nodeModulesPath = path.join(workspaceRoot, dir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log(`[preinstall] Removed ${path.relative(workspaceRoot, nodeModulesPath)}`);
  }
}

