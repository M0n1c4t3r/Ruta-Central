const fs = require('node:fs');
const path = require('node:path');

// Explicit production allowlist. Never copy the repository recursively.
const publicFiles = Object.freeze([
  'index.html', 'style.css', 'experience.css', 'menu-data.js', 'app.js',
  'assets/logo.png', 'assets/burger_hand.jpg', 'assets/burger-layers.png',
  'assets/italiano-studio.png', 'assets/carta-ruta-central.pdf',
  'assets/mini-hamburguesas.webp', 'assets/mini-sandwiches.webp',
  'assets/mini-completos.webp', 'assets/mini-compartir.webp',
  'assets/mini-bebidas.webp',
]);

function inventory(directory, prefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${relative}`);
    if (entry.isDirectory()) {
      if (relative !== 'assets') throw new Error(`Unexpected directory: ${relative}`);
      files.push(...inventory(path.join(directory, entry.name), relative + '/'));
    } else if (entry.isFile()) {
      if (!publicFiles.includes(relative)) throw new Error(`Unexpected public file: ${relative}`);
      files.push(relative);
    } else {
      throw new Error(`Unsupported entry: ${relative}`);
    }
  }
  return files.sort();
}

function build(root = __dirname) {
  const output = path.join(root, 'dist');
  // Fail closed on contaminated output; do not delete local files or follow links.
  if (fs.existsSync(output)) {
    if (!fs.lstatSync(output).isDirectory() || fs.lstatSync(output).isSymbolicLink()) {
      throw new Error('dist must be a real directory');
    }
    inventory(output);
  }
  for (const relative of publicFiles) {
    let current = root;
    for (const part of relative.split('/')) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Source symlink: ${relative}`);
    }
    if (!fs.statSync(current).isFile()) throw new Error(`Missing source file: ${relative}`);
  }
  fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
  for (const relative of publicFiles) {
    fs.copyFileSync(path.join(root, relative), path.join(output, relative));
  }
  if (inventory(output).length !== publicFiles.length) throw new Error('Incomplete public artifact');
  console.log(`PASS: dist contains only ${publicFiles.length} allowlisted public files.`);
  return output;
}

if (require.main === module) build();
module.exports = { publicFiles, inventory, build };
