import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, 'prototype-chatbot', 'src');
const destDir = path.join(__dirname, 'server', 'antigravity');

const sourceServerFile = path.join(__dirname, 'prototype-chatbot', 'server.js');
const destServerFile = path.join(__dirname, 'server', 'antigravity_server.js');

function moveDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            moveDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('Copying proxy source directory...');
    moveDir(sourceDir, destDir);
    console.log('Copying server.js...');
    fs.copyFileSync(sourceServerFile, destServerFile);

    // Read and update antigravity_server.js to use local imports correctly
    let serverCode = fs.readFileSync(destServerFile, 'utf8');
    serverCode = serverCode.replace(/.\/src\/utils\/proxy.js/g, './antigravity/utils/proxy.js');
    serverCode = serverCode.replace(/.\/src\/server.js/g, './antigravity/server.js');
    serverCode = serverCode.replace(/.\/src\/utils\/logger.js/g, './antigravity/utils/logger.js');
    fs.writeFileSync(destServerFile, serverCode);

    console.log('Successfully moved Antigravity proxy to server folder!');
    console.log('You can now safely delete the prototype-chatbot folder.');
} catch (e) {
    console.error('Error:', e);
}
