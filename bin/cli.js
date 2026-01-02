#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { listCache } from '../src/commands/list.js';
import { revalidateByTag, revalidateByUrl } from '../src/commands/revalidate.js';
import { existsSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('showNextCache')
  .description('CLI tool to inspect Next.js App Router cache')
  .version('0.1.0')
  .option('--revalidate-tag', 'Revalidate (clear) cache entries by tag')
  .option('--revalidate-url', 'Revalidate (clear) cache entries by URL');

// Check if .next directory exists
function checkNextJsProject() {
  const nextDir = join(process.cwd(), '.next');
  if (!existsSync(nextDir)) {
    console.error(chalk.red('Error: .next directory not found. Are you in a Next.js project?'));
    process.exit(1);
  }
  return nextDir;
}

// Default action
program.action(async (options) => {
  try {
    const nextDir = checkNextJsProject();

    if (options.revalidateTag) {
      await revalidateByTag(nextDir);
    } else if (options.revalidateUrl) {
      await revalidateByUrl(nextDir);
    } else {
      await listCache(nextDir);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
});

program.parse(process.argv);
