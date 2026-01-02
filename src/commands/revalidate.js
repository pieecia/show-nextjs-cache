import chalk from 'chalk';
import inquirer from 'inquirer';
import { getCacheEntries } from '../utils/cache.js';
import { unlinkSync } from 'fs';
import { formatSize } from '../utils/format.js';

/**
 * Interactive revalidate by tags
 */
export async function revalidateByTag(nextDir) {
  console.log(chalk.blue('Scanning cache for tags...\n'));

  const { entries } = getCacheEntries(nextDir);

  // Collect all unique tags with their entries
  const tagMap = new Map();

  entries.forEach(entry => {
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(entry);
      });
    }
  });

  if (tagMap.size === 0) {
    console.log(chalk.yellow('No tags found in cache entries.'));
    console.log(chalk.dim('Cache entries may not have tags or cache is empty.'));
    return;
  }

  // Prepare choices for inquirer
  const choices = Array.from(tagMap.entries()).map(([tag, entries]) => {
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    return {
      name: `${chalk.magenta(tag)} ${chalk.dim(`(${entries.length} entries, ${formatSize(totalSize)})`)}`,
      value: tag,
      short: tag
    };
  });

  // Sort by number of entries (descending)
  choices.sort((a, b) => {
    const aCount = tagMap.get(a.value).length;
    const bCount = tagMap.get(b.value).length;
    return bCount - aCount;
  });

  // Show interactive checkbox list
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tags',
      message: 'Select tags to revalidate (clear cache):',
      choices: choices,
    }
  ]);

  if (answers.tags.length === 0) {
    console.log(chalk.yellow('\nNo tags selected. Nothing to do.'));
    return;
  }

  // Collect all entries to delete
  const entriesToDelete = new Set();
  answers.tags.forEach(tag => {
    tagMap.get(tag).forEach(entry => {
      entriesToDelete.add(entry);
    });
  });

  console.log(chalk.white(`\nWill delete ${chalk.green(entriesToDelete.size)} cache entries\n`));

  // Confirm deletion
  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Are you sure you want to delete these cache entries?',
      default: true
    }
  ]);

  if (!confirm.proceed) {
    console.log(chalk.yellow('\nCancelled. No cache entries were deleted.'));
    return;
  }

  // Delete the cache files
  let deleted = 0;
  let failed = 0;

  for (const entry of entriesToDelete) {
    try {
      unlinkSync(entry.fullPath);
      deleted++;
    } catch (error) {
      console.error(chalk.red(`Failed to delete: ${entry.path}`));
      failed++;
    }
  }

  console.log();
  console.log(chalk.green(`✓ Successfully deleted ${deleted} cache entries`));

  if (failed > 0) {
    console.log(chalk.red(`✗ Failed to delete ${failed} entries`));
  }
}

/**
 * Interactive revalidate by URL
 */
export async function revalidateByUrl(nextDir) {
  console.log(chalk.blue('Scanning cache for URLs...\n'));

  const { entries } = getCacheEntries(nextDir);

  // Filter entries that have URLs (fetch cache)
  const urlEntries = entries.filter(entry => entry.url);

  if (urlEntries.length === 0) {
    console.log(chalk.yellow('No URL entries found in cache.'));
    console.log(chalk.dim('Cache may be empty or entries don\'t have URLs.'));
    return;
  }

  // Prepare choices for inquirer
  const choices = urlEntries.map(entry => {
    return {
      name: `${chalk.cyan(entry.url)} ${chalk.dim(`(${formatSize(entry.size)})`)}`,
      value: entry,
      short: entry.url
    };
  });

  // Sort by URL alphabetically
  choices.sort((a, b) => a.value.url.localeCompare(b.value.url));

  // Show interactive checkbox list
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'entries',
      message: 'Select URLs to revalidate (clear cache):',
      choices: choices,
      pageSize: 30
    }
  ]);

  if (answers.entries.length === 0) {
    console.log(chalk.yellow('\nNo URLs selected. Nothing to do.'));
    return;
  }

  console.log(chalk.white(`\nWill delete ${chalk.green(answers.entries.length)} cache entries\n`));

  // Confirm deletion
  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Are you sure you want to delete these cache entries?',
      default: true
    }
  ]);

  if (!confirm.proceed) {
    console.log(chalk.yellow('\nCancelled. No cache entries were deleted.'));
    return;
  }

  // Delete the cache files
  let deleted = 0;
  let failed = 0;

  for (const entry of answers.entries) {
    try {
      unlinkSync(entry.fullPath);
      deleted++;
    } catch (error) {
      console.error(chalk.red(`Failed to delete: ${entry.path}`));
      failed++;
    }
  }

  console.log();
  console.log(chalk.green(`✓ Successfully deleted ${deleted} cache entries`));

  if (failed > 0) {
    console.log(chalk.red(`✗ Failed to delete ${failed} entries`));
  }
}