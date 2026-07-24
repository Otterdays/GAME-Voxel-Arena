// [TRACE: SCRATCHPAD.md] — SOCOM-style intel / version briefing

export const BUILD_VERSION = '0.47';

export const VERSION_NOTES = [
    {
        ver: '0.47',
        codename: 'BRIEFING ROOM',
        date: '2026-07-24',
        bullets: [
            'Homescreen redesigned as SpecOps command briefing',
            'Intel / version modal with build notes',
            'UI shifted toward SOCOM / early Clancy tactical look',
        ],
    },
    {
        ver: '0.46',
        codename: 'COMBAT LOOP',
        date: '2026-07-24',
        bullets: [
            'HUD: HP, ammo, kills, damage vignette, hitmarkers',
            'Reload wired (R) + auto-reload when empty',
            'Death / respawn + team-safe hit detection',
        ],
    },
    {
        ver: '0.45',
        codename: 'FIELD INPUT',
        date: '2026-07-24',
        bullets: [
            'Laptop touchpad spike clamp + stuck-key clears',
            'Pointer-lock look ignore window',
            'Mouse sensitivity setting applied in-game',
        ],
    },
    {
        ver: '0.44',
        codename: 'SIDEARM',
        date: '2026-07-24',
        bullets: [
            'Glock viewmodel cohesion pass',
            'Inset serrations, connected trigger guard',
            'Tighter hand grip on polymer frame',
        ],
    },
    {
        ver: '0.43',
        codename: 'HOSTILES',
        date: '2026-07-24',
        bullets: [
            'Bot AI chase / face / shoot FSM',
            'Viewmodel near-plane + team-color fix',
            'WASD move matches camera look',
        ],
    },
];

export function renderVersionBriefing(container) {
    if (!container) return;
    container.innerHTML = '';

    const stamp = document.createElement('div');
    stamp.className = 'version-stamp';
    stamp.textContent = 'CLASSIFIED — NEED TO KNOW';
    container.appendChild(stamp);

    for (const entry of VERSION_NOTES) {
        const block = document.createElement('article');
        block.className = 'version-entry';
        block.innerHTML = `
            <header class="version-entry-head">
                <span class="version-tag">BUILD ${entry.ver}</span>
                <span class="version-code">${entry.codename}</span>
                <span class="version-date">${entry.date}</span>
            </header>
            <ul class="version-bullets">
                ${entry.bullets.map((b) => `<li>${b}</li>`).join('')}
            </ul>
        `;
        container.appendChild(block);
    }
}
