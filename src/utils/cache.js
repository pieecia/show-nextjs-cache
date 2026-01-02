import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Recursively scan cache directory and collect cache entries
 */
export function scanCacheDirectory(cacheDir) {
  const entries = [];

  function scan(dir, relativePath = '') {
    try {
      if (!existsSync(dir)) {
        return;
      }

      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath, join(relativePath, item));
        } else if (stat.isFile()) {
          const entry = {
            path: join(relativePath, item),
            fullPath: fullPath,
            size: stat.size,
            modified: stat.mtime,
            type: detectCacheType(relativePath, item)
          };

          // Try to read metadata if it's a JSON file or has metadata
          try {
            const metadata = readCacheMetadata(fullPath, item);
            if (metadata) {
              entry.metadata = metadata;

              // Extract key fields for fetch cache
              if (metadata.data?.url) {
                entry.url = metadata.data.url;
              }
              if (metadata.revalidate !== undefined) {
                entry.revalidate = metadata.revalidate;
              }
              if (metadata.tags) {
                entry.tags = metadata.tags;
              }
            }
          } catch (error) {
            // Ignore metadata read errors
          }

          entries.push(entry);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }

  scan(cacheDir);
  return entries;
}

/**
 * Detect cache type based on path
 */
function detectCacheType(path) {
  if (path.includes('fetch-cache')) {
    return 'fetch';
  }
  if (path.includes('images')) {
    return 'image';
  }
  return 'other';
}

/**
 * Try to read cache metadata
 */
function readCacheMetadata(fullPath, filename) {
  try {
    // Try to read as JSON first
    if (filename.endsWith('.json') || filename.endsWith('.meta')) {
      const content = readFileSync(fullPath, 'utf-8');
      return JSON.parse(content);
    }

    // For fetch-cache entries, Next.js stores data in binary format
    // but may have associated metadata files
    const metaPath = fullPath + '.meta';
    if (existsSync(metaPath)) {
      const content = readFileSync(metaPath, 'utf-8');
      return JSON.parse(content);
    }

    // Try to parse the file itself if it looks like JSON
    const content = readFileSync(fullPath, 'utf-8');
    if (content.startsWith('{') || content.startsWith('[')) {
      return JSON.parse(content);
    }
  } catch (error) {
    // Not JSON or unreadable, return null
  }

  return null;
}

/**
 * Get all cache entries from the Next.js cache directory
 */
export function getCacheEntries(nextDir) {
  const cacheDir = join(nextDir, 'cache');

  if (!existsSync(cacheDir)) {
    return {
      entries: [],
      stats: {
        totalSize: 0,
        totalCount: 0,
        byType: {}
      }
    };
  }

  const entries = scanCacheDirectory(cacheDir);

  // Calculate stats
  const stats = {
    totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
    totalCount: entries.length,
    byType: {}
  };

  entries.forEach(entry => {
    if (!stats.byType[entry.type]) {
      stats.byType[entry.type] = {
        count: 0,
        size: 0
      };
    }
    stats.byType[entry.type].count++;
    stats.byType[entry.type].size += entry.size;
  });

  return { entries, stats };
}
