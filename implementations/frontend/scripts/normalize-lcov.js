const fs = require('node:fs');
const path = require('node:path');

const coverageDir = path.resolve(__dirname, '..', 'coverage');
const lcovPath = path.join(coverageDir, 'lcov.info');

if (!fs.existsSync(lcovPath)) {
  console.error(`lcov.info not found at ${lcovPath}. Run jest --coverage first.`);
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const raw = fs.readFileSync(lcovPath, 'utf8');

const normalized = raw
  .split(/\r?\n/)
  .map((line) => {
    if (!line.startsWith('SF:')) return line;

    let filePath = line.slice(3).replaceAll('\\', '/');

    if (path.isAbsolute(filePath)) {
      const rel = path.relative(repoRoot, filePath);
      if (rel) {
        filePath = rel.replaceAll('\\', '/');
      }
    }

    if (
      !filePath.startsWith('implementations/frontend/') &&
      filePath.startsWith('src/')
    ) {
      filePath = `implementations/frontend/${filePath}`;
    }

    return `SF:${filePath}`;
  })
  .join('\n');

fs.writeFileSync(lcovPath, normalized, 'utf8');
console.log(`Normalized lcov paths in ${lcovPath}`);