const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "src", "loc");
const targetDir = path.join(root, "lib", "loc");

fs.mkdirSync(targetDir, { recursive: true });

for (const file of fs.readdirSync(sourceDir)) {
  if (!file.endsWith(".js") && !file.endsWith(".d.ts")) continue;
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}
