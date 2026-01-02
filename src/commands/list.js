import Table from 'cli-table3';
import chalk from 'chalk';
import { getCacheEntries } from '../utils/cache.js';
import { formatSize, getRelativeTime, formatRevalidate } from '../utils/format.js';

export async function listCache(nextDir) {
  console.log(chalk.blue('Scanning Next.js cache...\n'));

  const { entries, stats } = getCacheEntries(nextDir);

  // Show only fetch-cache entries in the table
  const filteredEntries = entries.filter(entry => entry.type === 'fetch');

  if (filteredEntries.length === 0) {
    console.log(chalk.yellow('No cache entries found.'));
    console.log(chalk.dim('Cache directory may be empty or not yet created.'));
    return;
  }

  // Create table
  const table = new Table({
    head: [
      chalk.cyan('Type'),
      chalk.cyan('URL'),
      chalk.cyan('Revalidate'),
      chalk.cyan('Tags'),
      chalk.cyan('Size'),
      chalk.cyan('Age')
    ],
    colWidths: [8, 50, 14, 20, 10, 20],
    wordWrap: true
  });

  // Sort entries by modified date (newest first)
  filteredEntries.sort((a, b) => b.modified - a.modified);

  // Add rows to table
  filteredEntries.forEach(entry => {
    const typeColor = getTypeColor(entry.type);

    // Format URL - truncate if too long
    const url = entry.url
      ? (entry.url.length > 49 ? entry.url.substring(0, 45) + '...' : entry.url)
      : chalk.dim('-');

    // Format revalidate time
    const revalidate = formatRevalidate(entry.revalidate);

    // Format tags
    const tags = entry.tags && entry.tags.length > 0
      ? entry.tags.join(', ')
      : chalk.dim('-');

    table.push([
      chalk[typeColor](entry.type),
      chalk.white(url),
      chalk.yellow(revalidate),
      chalk.magenta(tags),
      chalk.green(formatSize(entry.size)),
      chalk.dim(getRelativeTime(entry.modified))
    ]);
  });

  console.log(table.toString());

  // Display summary
  console.log('\n' + chalk.bold('Summary:'));
  console.log(chalk.white(`Total entries: ${chalk.green(stats.totalCount)}`));
  console.log(chalk.white(`Total size: ${chalk.green(formatSize(stats.totalSize))}`));

  if (Object.keys(stats.byType).length > 0) {
    console.log('\n' + chalk.bold('By type:'));
    Object.entries(stats.byType).forEach(([type, data]) => {
      const typeColor = getTypeColor(type);
      console.log(
        `  ${chalk[typeColor](type.padEnd(10))} - ` +
        `${chalk.white(data.count)} entries, ` +
        `${chalk.green(formatSize(data.size))}`
      );
    });
  }
}

/**
 * Get color for a cache type
 */
function getTypeColor(type) {
  const colors = {
    fetch: 'blue',
    image: 'green',
    ISR: 'magenta',
    RSC: 'cyan',
    unknown: 'gray'
  };
  return colors[type] || 'gray';
}
