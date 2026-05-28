import { fetch } from 'undici';
import fs from 'fs';

async function getSecret() {
    try {
        console.log("Fetching opencode-antigravity-auth package metadata...");
        const res = await fetch('https://registry.npmjs.org/opencode-antigravity-auth/latest');
        const data = await res.json();
        const tarballUrl = data.dist.tarball;
        console.log("Tarball URL:", tarballUrl);
        console.log("Please download this tarball manually, extract it, and search for 'client_secret' inside the code!");
    } catch (e) {
        console.error(e);
    }
}

getSecret();
