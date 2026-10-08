const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = [
  "index.html",
  "Lumi Colouring book.html",
  "Lumi Preview.html",
  "contact-form-handler.js",
];
const directories = ["assets", "lumi-preview", "lumi-preview-banner"];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true,
  });
}

console.log(`Cloudflare site built in ${path.relative(root, output)}/`);
