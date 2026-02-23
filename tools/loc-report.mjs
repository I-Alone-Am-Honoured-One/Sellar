#!/usr/bin/env node
import { execSync } from 'node:child_process';

const target = 140000;
const cmd = "rg --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/coverage/**' --glob '*.ts' --glob '*.tsx' --glob '*.js' --glob '*.mjs' --glob '*.cjs' --glob '*.md' -n '^' apps packages docs .github tools README.md docker-compose.yml package.json turbo.json pnpm-workspace.yaml tsconfig.base.json | wc -l";
const output = execSync(cmd, { encoding: 'utf8' }).trim();
const loc = Number(output);
const gap = Math.max(target - loc, 0);

console.log(JSON.stringify({ loc, target, gap, metTarget: loc >= target }, null, 2));
if (loc < target) process.exitCode = 2;
