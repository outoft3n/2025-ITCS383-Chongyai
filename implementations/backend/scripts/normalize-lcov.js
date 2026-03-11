const fs = require('node:fs');
const path = require('node:path');

const coverageDir = path.resolve(__dirname, '..', 'coverage');
const lcovPath = path.join(coverageDir, 'lcov.info');

if (!fs.existsSync(lcovPath)) {
  console.error(`lcov.info not found at ${lcovPath}. Run jest --coverage first.`);
  process.exit(1);
}

const raw = fs.readFileSync(lcovPath, 'utf8');
const lines = raw.split(/\r?\n/);

const normalized = lines.map((line) => {
  if (!line.startsWith('SF:')) return line;

  let filePath = line.slice(3);
  filePath = filePath.replaceAll('\\', '/');

  if (path.isAbsolute(filePath)) {
    const repoRoot = path.resolve(__dirname, '..', '..');
    const rel = path.relative(repoRoot, filePath);
    if (rel) {
      filePath = rel.replaceAll('\\', '/');
    }
  }

  if (!filePath.startsWith('implementations/backend/')) {
    if (filePath.startsWith('src/')) {
      filePath = `implementations/backend/${filePath}`;
    }
  }

  return `SF:${filePath}`;
});

fs.writeFileSync(lcovPath, normalized.join('\n'));
console.log(`Normalized lcov paths in ${lcovPath}`);