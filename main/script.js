const canvas = document.getElementById('matrix-canvas');
const ctx = canvas?.getContext('2d');
const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%^&*()_+-=[]{}|;:,.<>?';
const fontSize = 14;
let drops = [];

function resizeCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = Array(Math.ceil(canvas.width / fontSize)).fill(1);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawMatrix() {
    if (!canvas || !ctx) return;
    const darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = darkTheme ? 'rgba(5, 5, 10, 0.1)' : 'rgba(241, 245, 249, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(drawMatrix, 50);
}

const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem('derry_sec_theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
htmlElement.setAttribute('data-theme', savedTheme || preferredTheme);

themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('derry_sec_theme', newTheme);
});

const navigation = document.getElementById('primary-navigation');
const menuToggle = document.getElementById('mobile-menu-toggle');

function setMenuOpen(isOpen) {
    navigation?.classList.toggle('open', isOpen);
    menuToggle?.setAttribute('aria-expanded', String(isOpen));
    menuToggle?.querySelector('i')?.classList.toggle('fa-bars', !isOpen);
    menuToggle?.querySelector('i')?.classList.toggle('fa-xmark', isOpen);
}

menuToggle?.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
});

const projectCards = [...document.querySelectorAll('.project-card')];
document.querySelectorAll('.project-filter').forEach((button) => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        document.querySelectorAll('.project-filter').forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle('active', isActive);
            filterButton.setAttribute('aria-pressed', String(isActive));
        });
        projectCards.forEach((card) => {
            card.hidden = filter !== 'all' && card.dataset.projectType !== filter;
        });
    });
});

const caseStudiesData = {
    1: {
        title: "Network Perimeter Hardening",
        id: "PRACTICE SCENARIO #01",
        status: "CONCEPT",
        statusClass: "practice",
        overview: "A proposed learning scenario for reviewing exposed services, access rules, and security settings in an authorized practice environment.",
        objective: "Learn how to inventory services, review network access rules, and identify practical hardening steps.",
        methodology: [
            "Set up an isolated practice network or intentionally vulnerable lab.",
            "Review scan results and identify services that should not be exposed.",
            "Document findings and recommend safer firewall and service settings."
        ],
        results: "No real system was tested. The intended outcome is a documented list of observations, risks, and defensive recommendations."
    },
    2: {
        title: "SQL Injection Prevention",
        id: "PRACTICE SCENARIO #02",
        status: "CONCEPT",
        statusClass: "practice",
        overview: "A web security study of unsafe database queries and how parameterized queries help prevent injection.",
        objective: "Understand why concatenating untrusted input into SQL is risky and how parameterized queries reduce that risk.",
        methodology: [
            "Use a local training application designed for security practice.",
            "Compare an unsafe query pattern with a parameterized query in sample code.",
            "Record the defensive changes and verify expected behavior with safe test inputs."
        ],
        results: "No production application was tested. The intended outcome is a clear explanation and example of the safer query pattern."
    }
};

const modalOverlay = document.getElementById('case-modal');
const modalBodyContent = document.getElementById('modal-body-content');
let modalTrigger = null;

function openModal(caseId) {
    const data = caseStudiesData[caseId];
    if (!data || !modalOverlay || !modalBodyContent) return;
    modalTrigger = document.activeElement;

    modalBodyContent.innerHTML = `
        <div class="case-banner">
            <span class="case-id">${data.id}</span>
            <span class="case-status ${data.statusClass}">${data.status}</span>
        </div>
        <div class="modal-body">
            <h3 id="modal-heading">${data.title}</h3>
            <h4>Executive Summary</h4>
            <p>${data.overview}</p>
            
            <h4>Operational Objective</h4>
            <p>${data.objective}</p>
            
            <h4>Methodology & Execution</h4>
            <ul>
                ${data.methodology.map(item => `<li>${item}</li>`).join('')}
            </ul>
            
            <h4>Outcome & Remediation</h4>
            <p>${data.results}</p>
        </div>
    `;

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalOverlay.querySelector('.modal-close')?.focus();
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalTrigger?.focus();
}

modalOverlay?.querySelector('.modal-close')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (!modalOverlay?.classList.contains('active')) return;
    if (e.key === 'Escape') {
        closeModal();
        return;
    }
    if (e.key === 'Tab') {
        const focusable = [...modalOverlay.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) {
            e.preventDefault();
        } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

document.querySelectorAll('.expand-case-btn').forEach((button) => {
    button.addEventListener('click', () => openModal(button.dataset.case));
});

const terminalForm = document.getElementById('terminal-form-cli');
const terminalInput = document.getElementById('terminal-command');
const terminalOutput = document.getElementById('terminal-output');
const terminalHistory = [];
let terminalHistoryIndex = 0;

function printTerminalLine(text, className = '') {
    if (!terminalOutput) return;
    const line = document.createElement('p');
    line.textContent = text;
    if (className) line.className = className;
    terminalOutput.append(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

const terminalCommands = {
    help: () => 'Commands: help, about, skills, projects, figma, radar, ctf, contact, status, scan, goto <section>, clear',
    about: () => 'Derry Sagusay: IT student learning cybersecurity, networking, and web development.',
    skills: () => 'Current focus: networking, cybersecurity fundamentals, web development, and Python.',
    projects: () => jumpToSection('projects', 'Opening projects.'),
    figma: () => jumpToSection('figma', 'Opening the Figma project section.'),
    radar: () => jumpToSection('radar', 'Opening the simulated perimeter radar.'),
    ctf: () => jumpToSection('ctf', 'Opening the local CTF practice arena.'),
    contact: () => jumpToSection('contact', 'Opening the contact section.'),
    status: () => `Demo systems online. ${radarTargets.length} simulated nodes; no network scanning is active.`,
    scan: () => {
        addTelemetryEvent('DEMO', 'Local radar display refreshed; no network scan performed');
        return 'Simulated radar refreshed. No devices or networks were scanned.';
    }
};

function jumpToSection(sectionId, message) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    return message;
}

function runTerminalCommand(rawCommand) {
    const [command, ...argumentsList] = rawCommand.trim().toLowerCase().split(/\s+/);
    if (!command) return;
    printTerminalLine(`> ${[command, ...argumentsList].join(' ')}`, 'terminal-command-echo');
    if (command === 'clear') {
        terminalOutput?.replaceChildren();
        return;
    }
    if (command === 'goto') {
        const section = argumentsList[0];
        const sectionIds = ['about', 'cli', 'radar', 'skills', 'projects', 'figma', 'labs', 'ctf', 'education', 'contact'];
        printTerminalLine(sectionIds.includes(section)
            ? terminalCommands[section]?.() || jumpToSection(section, `Opening ${section}.`)
            : 'Usage: goto <about|cli|radar|skills|projects|figma|labs|ctf|education|contact>');
        return;
    }
    printTerminalLine(terminalCommands[command]?.() || `Command not found: ${command}. Type help for options.`);
}

terminalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = terminalInput.value.trim();
    if (command) {
        terminalHistory.push(command);
        terminalHistoryIndex = terminalHistory.length;
        runTerminalCommand(command);
    }
    terminalInput.value = '';
});

terminalInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && terminalHistory.length) {
        event.preventDefault();
        terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
        terminalInput.value = terminalHistory[terminalHistoryIndex];
    } else if (event.key === 'ArrowDown' && terminalHistory.length) {
        event.preventDefault();
        terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
        terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
    }
});

document.getElementById('terminal-clear')?.addEventListener('click', () => {
    terminalOutput?.replaceChildren();
});

document.querySelectorAll('.command-chips button').forEach((button) => {
    button.addEventListener('click', () => runTerminalCommand(button.dataset.command));
});

const radarCanvas = document.getElementById('radar-canvas');
const radarContext = radarCanvas?.getContext('2d');
const radarTargets = [
    { angle: 0.42, distance: 0.42, type: 'stable' },
    { angle: 1.85, distance: 0.68, type: 'watch' },
    { angle: 3.2, distance: 0.34, type: 'stable' },
    { angle: 5.15, distance: 0.79, type: 'stable' }
];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let radarSweep = 0;
let radarPaused = reduceMotion;
let telemetryEventCount = 0;

function drawRadar() {
    if (!radarCanvas || !radarContext) return;
    const bounds = radarCanvas.getBoundingClientRect();
    if (!bounds.width) return;
    const pixelRatio = window.devicePixelRatio || 1;
    if (radarCanvas.width !== Math.round(bounds.width * pixelRatio)) {
        radarCanvas.width = Math.round(bounds.width * pixelRatio);
        radarCanvas.height = Math.round(bounds.width * pixelRatio);
    }
    radarContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const context = radarContext;
    const size = bounds.width;
    const center = size / 2;
    const radius = size * 0.43;
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--text-primary').trim();
    const grid = styles.getPropertyValue('--panel-border').trim();
    context.clearRect(0, 0, size, size);
    context.strokeStyle = grid;
    context.lineWidth = 1;

    for (let ring = 1; ring <= 4; ring++) {
        context.beginPath();
        context.arc(center, center, radius * ring / 4, 0, Math.PI * 2);
        context.stroke();
    }

    context.beginPath();
    context.moveTo(center - radius, center);
    context.lineTo(center + radius, center);
    context.moveTo(center, center - radius);
    context.lineTo(center, center + radius);
    context.stroke();

    const sweepStart = radarSweep - 0.45;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, sweepStart, radarSweep);
    context.closePath();
    context.fillStyle = primary === '#0d9488' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(0, 255, 128, 0.16)';
    context.fill();

    context.beginPath();
    context.moveTo(center, center);
    context.lineTo(center + Math.cos(radarSweep) * radius, center + Math.sin(radarSweep) * radius);
    context.strokeStyle = primary;
    context.lineWidth = 2;
    context.stroke();

    radarTargets.forEach((target) => {
        const targetX = center + Math.cos(target.angle) * radius * target.distance;
        const targetY = center + Math.sin(target.angle) * radius * target.distance;
        context.beginPath();
        context.arc(targetX, targetY, size * 0.012, 0, Math.PI * 2);
        context.fillStyle = target.type === 'watch' ? '#f0b44c' : primary;
        context.shadowBlur = 12;
        context.shadowColor = context.fillStyle;
        context.fill();
        context.shadowBlur = 0;
    });

    if (!radarPaused) radarSweep = (radarSweep + 0.018) % (Math.PI * 2);
}

function animateRadar() {
    drawRadar();
    if (!reduceMotion) window.requestAnimationFrame(animateRadar);
}

animateRadar();
window.addEventListener('resize', drawRadar);

const radarToggle = document.getElementById('radar-toggle');
if (reduceMotion && radarToggle) {
    radarToggle.disabled = true;
    radarToggle.setAttribute('aria-pressed', 'true');
    radarToggle.textContent = 'Animation disabled by motion preference';
}

radarToggle?.addEventListener('click', (event) => {
    radarPaused = !radarPaused;
    const button = event.currentTarget;
    button.setAttribute('aria-pressed', String(radarPaused));
    button.innerHTML = radarPaused
        ? '<i class="fa-solid fa-play"></i> Resume animation'
        : '<i class="fa-solid fa-pause"></i> Pause animation';
});

function updateTelemetryClock() {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    document.getElementById('telemetry-time').textContent = timeLabel;
    document.querySelectorAll('#telemetry-log time').forEach((time) => {
        if (time.textContent === '--:--:--') time.textContent = timeLabel;
    });
    document.getElementById('telemetry-latency').textContent = String(12 + Math.floor(Math.random() * 19));
}

function addTelemetryEvent(level, message) {
    const log = document.getElementById('telemetry-log');
    if (!log) return;
    const item = document.createElement('li');
    const time = document.createElement('time');
    const tag = document.createElement('span');
    const detail = document.createElement('span');
    time.textContent = new Date().toLocaleTimeString();
    tag.textContent = level;
    tag.className = level === 'WATCH' ? 'log-watch' : 'log-ok';
    detail.textContent = message;
    item.append(time, tag, detail);
    log.prepend(item);
    while (log.children.length > 5) log.lastElementChild.remove();
}

updateTelemetryClock();
window.setInterval(updateTelemetryClock, 2000);
window.setInterval(() => {
    telemetryEventCount++;
    const event = telemetryEventCount % 3 === 0
        ? ['WATCH', 'Demo node flagged for observation']
        : ['INFO', 'Synthetic perimeter heartbeat received'];
    addTelemetryEvent(event[0], event[1]);
}, 6500);

const ctfChallenges = [
    {
        category: 'CRYPTOGRAPHY / 01',
        title: 'The Shift',
        description: 'Each letter was shifted forward by 3. Shift the text back to reveal the flag.',
        clue: 'IODJ{FDHVDU}',
        flag: 'FLAG{CAESAR}'
    },
    {
        category: 'ENCODING / 02',
        title: 'The Printable Message',
        description: 'This string is Base64-encoded. Decode it to recover the flag.',
        clue: 'RkxBR3tCQVNFNjR9',
        flag: 'FLAG{BASE64}'
    },
    {
        category: 'CRYPTOGRAPHY / 03',
        title: 'The Mirror Alphabet',
        description: 'Apply ROT13 to the text. Each letter maps to the one 13 places away in the alphabet.',
        clue: 'SYNT{EBG13}',
        flag: 'FLAG{ROT13}'
    }
];
let activeChallenge = 0;
const solvedChallenges = new Set();
try {
    const savedProgress = JSON.parse(localStorage.getItem('derry_ctf_solved_v1') || '[]');
    if (Array.isArray(savedProgress)) {
        savedProgress
            .filter((index) => Number.isInteger(index) && index >= 0 && index < ctfChallenges.length)
            .forEach((index) => solvedChallenges.add(index));
    }
} catch {
}

document.getElementById('ctf-score').textContent = String(solvedChallenges.size);
document.querySelectorAll('.ctf-tab').forEach((tab) => {
    if (solvedChallenges.has(Number(tab.dataset.challenge))) tab.classList.add('solved');
});

function selectChallenge(index) {
    activeChallenge = index;
    const challenge = ctfChallenges[index];
    document.getElementById('ctf-category').textContent = challenge.category;
    document.getElementById('ctf-title').textContent = challenge.title;
    document.getElementById('ctf-description').textContent = challenge.description;
    document.getElementById('ctf-clue').textContent = challenge.clue;
    document.getElementById('ctf-feedback').textContent = solvedChallenges.has(index)
        ? 'Challenge solved. You can revisit it any time.'
        : '';
    document.getElementById('ctf-feedback').className = 'ctf-feedback';
    document.querySelectorAll('.ctf-tab').forEach((tab, tabIndex) => {
        tab.classList.toggle('active', tabIndex === index);
        tab.setAttribute('aria-pressed', String(tabIndex === index));
    });
}

document.querySelectorAll('.ctf-tab').forEach((tab) => {
    tab.addEventListener('click', () => selectChallenge(Number(tab.dataset.challenge)));
});

document.getElementById('ctf-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const answerInput = document.getElementById('ctf-answer');
    const feedback = document.getElementById('ctf-feedback');
    const answer = answerInput.value.trim().toUpperCase();
    if (answer === ctfChallenges[activeChallenge].flag) {
        solvedChallenges.add(activeChallenge);
        let saved = true;
        try {
            localStorage.setItem('derry_ctf_solved_v1', JSON.stringify([...solvedChallenges]));
        } catch {
            saved = false;
        }
        document.querySelector(`.ctf-tab[data-challenge="${activeChallenge}"]`)?.classList.add('solved');
        document.getElementById('ctf-score').textContent = String(solvedChallenges.size);
        feedback.textContent = saved
            ? 'Correct flag. Challenge cleared and progress saved.'
            : 'Correct flag. Challenge cleared for this session.';
        feedback.className = 'ctf-feedback correct';
        answerInput.value = '';
    } else {
        feedback.textContent = 'Not quite. Check the clue and try again.';
        feedback.className = 'ctf-feedback incorrect';
    }
});

const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('sender-name').value.trim();
    const email = document.getElementById('sender-email').value.trim();
    const message = document.getElementById('sender-msg').value.trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\nReply to: ${email}`);
    const feedback = document.getElementById('contact-feedback');
    feedback.textContent = 'Opening your email application with a prepared message.';
    feedback.classList.add('show');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.getElementById('current-year').textContent = new Date().getFullYear();

const navigationLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sectionsById = new Map(navigationLinks.map((link) => [
    link.hash.slice(1),
    document.getElementById(link.hash.slice(1))
]));
let scrollUpdatePending = false;

function updatePagePosition() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    document.getElementById('scroll-progress').style.transform = `scaleX(${progress})`;

    let activeSection = 'about';
    sectionsById.forEach((section, sectionId) => {
        if (section && section.getBoundingClientRect().top <= 150) activeSection = sectionId;
    });
    navigationLinks.forEach((link) => {
        const isActive = link.hash === `#${activeSection}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
    scrollUpdatePending = false;
}

window.addEventListener('scroll', () => {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(updatePagePosition);
}, { passive: true });
window.addEventListener('resize', updatePagePosition);
updatePagePosition();