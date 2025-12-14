#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Please provide a project name.");
  console.error("Usage: npm create eclips myapp");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), projectName);
const templateDir = path.join(__dirname, "..", "templates", "default");

// Prevent overwrite
if (fs.existsSync(targetDir)) {
  console.error(`❌ Folder "${projectName}" already exists.`);
  process.exit(1);
}

// Copy template
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(templateDir, targetDir, { recursive: true });

// Patch package.json name
const pkgPath = path.join(targetDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

pkg.name = projectName;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log("✅ Eclips app created successfully!");
console.log("");
console.log("Next steps:");
console.log(`  cd ${projectName}`);
console.log("  npm install");
console.log("  npm start");
