# show-next-cache

CLI tool to inspect and manage Next.js App Router cache.

## Features

- 📋 List all fetch cache entries with details (URL, revalidate time, tags, size, age)
- 🏷️ Revalidate (clear) cache by tag - interactive selection
- 🔗 Revalidate (clear) cache by URL - interactive selection
- 📊 Cache statistics breakdown by type
- 🎨 Colorful, formatted output

## Installation & Usage

### For Developers (Recommended)

No installation needed! Use `npx` to run directly in your Next.js project:

```bash
# Navigate to your Next.js project
cd /path/to/your-nextjs-project

# Run with npx (no installation required)
npx show-next-cache

# Revalidate by tag
npx show-next-cache --revalidate-tag

# Revalidate by URL
npx show-next-cache --revalidate-url
```

**That's it!** No dependencies added to your project.

### For Local Development

```bash
# Clone and install dependencies
npm install

# Link globally for testing
npm link

# Use in any Next.js project
cd /path/to/your-nextjs-project
show-next-cache
```

## Commands

### Default - List Cache

Display all fetch cache entries in a formatted table.

```bash
show-next-cache
```

**Output includes:**
- Type (fetch)
- URL
- Revalidate time
- Tags
- Size (human-readable)
- Age (relative time)

**Summary statistics:**
- Total cache entries
- Total cache size
- Breakdown by type (fetch, image, others)

### Revalidate by Tag

Interactively select tags to clear from cache.

```bash
show-next-cache --revalidate-tag
```

**Features:**
- Shows all unique tags with entry count and total size
- Multi-select with spacebar
- Confirmation prompt before deletion
- Sorted by number of entries

### Revalidate by URL

Interactively select URLs to clear from cache.

```bash
show-next-cache --revalidate-url
```

**Features:**
- Shows all cached URLs with size
- Multi-select with spacebar (30 items per page)
- Confirmation prompt before deletion
- Sorted alphabetically

### Help

```bash
show-next-cache --help
```

## Cache Types

The tool recognizes these Next.js cache types:

- **fetch** - Fetch cache from `fetch()` calls (shown in table)
- **image** - Optimized images (shown in stats only)
- **others** - Rest of files from the cache folder (shown in stats only)

## Requirements

- Node.js 16+
- Next.js project with `.next` directory (tested with v15)

## Development

```bash
# Test locally
node bin/cli.js

# Test in a Next.js project
cd /path/to/nextjs-project
node /path/to/show-next-cache/bin/cli.js

# Refresh global link after changes
npm unlink -g && npm link
```

## Roadmap

- [x] List fetch cache entries
- [x] Revalidate by tag
- [x] Revalidate by URL
- [x] Interactive selection
- [ ] `--stats` command for detailed statistics
- [ ] `--watch` mode for real-time monitoring
- [ ] Pattern matching for cache clearing
- [ ] Export to JSON

## License

MIT
