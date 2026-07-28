#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const USERNAME = process.env.USERNAME || process.env.GITHUB_REPOSITORY_OWNER || 'hosseinMsh';
const TOKEN = process.env.GITHUB_TOKEN;

function gh(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'profile-svg-generator',
        Accept: 'application/vnd.github.v3+json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Fetching data for ${USERNAME}...`);

  const [user, repos] = await Promise.all([
    gh(`/users/${USERNAME}`),
    gh(`/users/${USERNAME}/repos?per_page=100&sort=updated`),
  ]);

  if (user.message) {
    console.error('GitHub API error:', user.message);
    process.exit(1);
  }

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  const langMap = {};
  for (const r of repos) {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  }
  const totalLangs = Object.values(langMap).reduce((a, b) => a + b, 0);
  const topLangs = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, pct: Math.round((count / totalLangs) * 100) }));

  const displayName = user.name || USERNAME;
  const bio = (user.bio || '').substring(0, 60);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  console.log(`Generating SVG for ${displayName}...`);

  const svg = generateSVG({
    username: USERNAME,
    name: displayName,
    bio,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    repos: user.public_repos ?? 0,
    stars: totalStars,
    forks: totalForks,
    topLangs,
    updated: now,
  });

  fs.writeFileSync('profile.svg', svg);
  console.log('profile.svg generated successfully');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSVG(d) {
  const langRows = d.topLangs.slice(1, 3).map((l, i) => `
      <text x="512" y="${416 + i * 20}" font-size="11" fill="#475569">${esc(l.name)}</text>
      <rect x="580" y="${408 + i * 20}" width="110" height="8" rx="4" fill="#E2E8F0"/>
      <rect x="580" y="${408 + i * 20}" width="${Math.round((l.pct / 100) * 110)}" height="8" rx="4" fill="url(#accent)"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"
  font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"
  role="img" aria-label="${esc(d.username)} — profile.sh --live">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F8FAFC"/>
      <stop offset="1" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2563EB">
        <animate attributeName="stop-color" values="#2563EB;#06B6D4;#10B981;#2563EB" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="0.5" stop-color="#06B6D4">
        <animate attributeName="stop-color" values="#06B6D4;#10B981;#2563EB;#06B6D4" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="1" stop-color="#10B981">
        <animate attributeName="stop-color" values="#10B981;#2563EB;#06B6D4;#10B981" dur="10s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <linearGradient id="asciiGrad" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1D4ED8"/>
      <stop offset="1" stop-color="#7C3AED"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 -30; 0 30; 0 -30" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="asciiGrad2" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7C3AED"/>
      <stop offset="1" stop-color="#0891B2"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 30; 0 -30; 0 30" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="numGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2563EB"/>
      <stop offset="1" stop-color="#7C3AED"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 -10; 0 10; 0 -10" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="winClip"><rect x="2" y="2" width="956" height="536" rx="16"/></clipPath>
  </defs>

  <rect x="0" y="0" width="960" height="540" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <g clip-path="url(#winClip)">
    <rect x="2" y="2" width="956" height="536" fill="url(#bgGrad)"/>

    <!-- Title bar -->
    <rect x="0" y="0" width="960" height="42" fill="#F1F5F9"/>
    <line x1="0" y1="42" x2="960" y2="42" stroke="rgba(15,23,42,0.08)"/>
    <circle cx="28" cy="21" r="5" fill="#ff5f56"/>
    <circle cx="48" cy="21" r="5" fill="#ffbd2e"/>
    <circle cx="68" cy="21" r="5" fill="#27c93f"/>
    <text x="480" y="26" text-anchor="middle" font-size="13" fill="#475569">
      ${esc(d.username)}@github — ./profile.sh --live
    </text>

    <!-- Left panel -->
    <text x="40" y="70" font-size="10" letter-spacing="3" fill="#94A3B8">SYS.BANNER</text>
    <rect x="36" y="80" width="430" height="370" rx="10" fill="#F8FAFC" stroke="rgba(37,99,235,0.2)" stroke-width="1.5"/>

    <!-- ASCII Art Banner -->
    <g font-family="monospace" font-size="18" font-weight="bold">
      <g fill="url(#asciiGrad)">
        <text x="56" y="130" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.2s" fill="freeze"/>   ██╗  ██╗</text>
        <text x="56" y="155" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.4s" fill="freeze"/>   ██║  ██║</text>
        <text x="56" y="180" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.6s" fill="freeze"/>   ███████║</text>
        <text x="56" y="205" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.8s" fill="freeze"/>   ██╔══██║</text>
        <text x="56" y="230" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.0s" fill="freeze"/>   ██║  ██║</text>
        <text x="56" y="255" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.2s" fill="freeze"/>   ╚═╝  ╚═╝</text>
      </g>
      <g fill="url(#asciiGrad2)">
        <text x="210" y="130" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.35s" fill="freeze"/> ██████╗</text>
        <text x="210" y="155" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.55s" fill="freeze"/>██╔═══██╗</text>
        <text x="210" y="180" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.75s" fill="freeze"/>██║   ██║</text>
        <text x="210" y="205" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.95s" fill="freeze"/>██║   ██║</text>
        <text x="210" y="230" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.15s" fill="freeze"/>╚██████╔╝</text>
        <text x="210" y="255" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.35s" fill="freeze"/> ╚═════╝</text>
      </g>
      <g fill="url(#asciiGrad)">
        <text x="360" y="130" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.5s" fill="freeze"/> ██████╗</text>
        <text x="360" y="155" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.7s" fill="freeze"/>██╔════╝</text>
        <text x="360" y="180" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="0.9s" fill="freeze"/>███████╗</text>
        <text x="360" y="205" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.1s" fill="freeze"/>╚════██║</text>
        <text x="360" y="230" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.3s" fill="freeze"/>███████║</text>
        <text x="360" y="255" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.5s" fill="freeze"/>╚══════╝</text>
      </g>
    </g>

    <!-- Taglines -->
    <text x="56" y="300" font-size="13" fill="#64748B" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="1.8s" fill="freeze"/>
      &gt; <tspan fill="#2563EB">${esc(d.bio || 'Building things that matter')}</tspan>
    </text>
    <text x="56" y="325" font-size="12" fill="#94A3B8" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="2.2s" fill="freeze"/>
      &gt; <tspan fill="#06B6D4">${d.repos}</tspan> repos · <tspan fill="#06B6D4">${d.stars}</tspan> stars
    </text>
    <text x="56" y="348" font-size="12" fill="#94A3B8" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.8s" begin="2.6s" fill="freeze"/>
      &gt; <tspan fill="#10B981">${d.followers}</tspan> followers · <tspan fill="#10B981">${d.following}</tspan> following
    </text>
    <line x1="56" y1="365" x2="446" y2="365" stroke="url(#accent)" stroke-width="1" opacity="0.35"/>

    <!-- Right panel: Stats -->
    <text x="500" y="70" font-size="10" letter-spacing="3" fill="#94A3B8">SYS.STATS</text>

    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.5s" fill="freeze"/>
      <rect x="496" y="80" width="200" height="52" rx="8" fill="#FFFFFF" stroke="rgba(37,99,235,0.12)" stroke-width="1"/>
      <text x="512" y="104" font-size="11" fill="#94A3B8">REPOSITORIES</text>
      <text x="690" y="115" text-anchor="end" font-size="28" font-weight="bold" fill="url(#numGrad)">${d.repos}</text>
    </g>
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.8s" fill="freeze"/>
      <rect x="496" y="140" width="200" height="52" rx="8" fill="#FFFFFF" stroke="rgba(6,182,212,0.12)" stroke-width="1"/>
      <text x="512" y="164" font-size="11" fill="#94A3B8">STARS</text>
      <text x="690" y="175" text-anchor="end" font-size="28" font-weight="bold" fill="url(#numGrad)">${d.stars}</text>
    </g>
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="1.1s" fill="freeze"/>
      <rect x="496" y="200" width="200" height="52" rx="8" fill="#FFFFFF" stroke="rgba(16,185,129,0.12)" stroke-width="1"/>
      <text x="512" y="224" font-size="11" fill="#94A3B8">FOLLOWERS</text>
      <text x="690" y="235" text-anchor="end" font-size="28" font-weight="bold" fill="url(#numGrad)">${d.followers}</text>
    </g>
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="1.4s" fill="freeze"/>
      <rect x="496" y="260" width="200" height="52" rx="8" fill="#FFFFFF" stroke="rgba(124,58,237,0.12)" stroke-width="1"/>
      <text x="512" y="284" font-size="11" fill="#94A3B8">FOLLOWING</text>
      <text x="690" y="295" text-anchor="end" font-size="28" font-weight="bold" fill="url(#numGrad)">${d.following}</text>
    </g>

    <!-- Top language -->
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="1.7s" fill="freeze"/>
      <rect x="496" y="324" width="200" height="56" rx="8" fill="#FFFFFF" stroke="rgba(148,163,184,0.2)" stroke-width="1"/>
      <text x="512" y="346" font-size="11" fill="#94A3B8">TOP LANGUAGE</text>
      <text x="690" y="362" text-anchor="end" font-size="20" font-weight="bold" fill="#475569">${esc(d.topLangs[0]?.name || '—')}</text>
      <text x="690" y="374" text-anchor="end" font-size="11" fill="#94A3B8">${d.topLangs[0]?.pct || ''}% of repos</text>
    </g>

    <!-- Language bars (if more than 1) -->
    ${d.topLangs.length > 1 ? `
    <g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.6s" begin="2.0s" fill="freeze"/>
      <text x="512" y="402" font-size="10" fill="#94A3B8">LANGUAGES</text>
      ${langRows}
    </g>` : ''}

    <!-- Bottom terminal -->
    <rect x="2" y="465" width="956" height="73" fill="#0F172A"/>
    <text x="40" y="495" font-size="14" fill="#38BDF8">
      ${esc(d.username)}@github:~$ ./profile.sh --status
    </text>
    <text x="40" y="520" font-size="13" fill="#64748B">
      ▸ profile active · last synced <tspan fill="#94A3B8">${d.updated}</tspan>
    </text>
    <rect x="335" y="487" width="9" height="16" rx="1" fill="#38BDF8">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>`;
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
