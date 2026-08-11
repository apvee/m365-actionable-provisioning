const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '..', 'dist', 'cjs', 'package.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, '{"type":"commonjs"}\n', 'utf8');
