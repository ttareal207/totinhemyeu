/* ============================================================
   TỎ TÌNH — FIXED SCRIPTS
   Fixes: Audio HTML5, Typewriter newlines, Observer, Rings
   ============================================================ */

// ===== PRELOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('hidden');
        initStars();
        startFloatingHearts();
        startRosePetals();
        animateWelcomeTitle();
        createTitleSparkles();
    }, 2200);
});

// ===================================================================
// ===== HTML5 AUDIO PLAYER (works on file://) ======================
// ===================================================================
const bgAudio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('music-toggle');
const npText = document.getElementById('np-text');
let isPlaying = false;

if (bgAudio) {
    bgAudio.volume = 0.5;
}

// Music toggle button
musicBtn.addEventListener('click', () => {
    if (!bgAudio) return;
    if (isPlaying) {
        bgAudio.pause();
        musicBtn.classList.remove('playing');
        if (npText) npText.textContent = 'Đã tạm dừng ⏸';
    } else {
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicBtn.classList.add('playing');
                updateNowPlaying();
            }).catch(err => {
                console.warn('Chưa có file nhạc hoặc trình duyệt chặn autoplay:', err.message);
                if (npText) npText.textContent = '⚠️ Cần file mp3 trong thư mục!';
                musicBtn.classList.remove('playing');
                isPlaying = false;
                return;
            });
        }
    }
    isPlaying = !isPlaying;
});

// Song item click — swap audio source
const songItems = document.querySelectorAll('.song-item');
songItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = item.dataset.src;
        if (!src || !bgAudio) return;

        songItems.forEach(s => s.classList.remove('active'));
        item.classList.add('active');

        const wasPaused = bgAudio.paused;
        bgAudio.src = src;
        bgAudio.load();

        if (!wasPaused) {
            bgAudio.play().catch(() => {
                if (npText) npText.textContent = '⚠️ Không tìm thấy file: ' + src;
            });
        }
        updateNowPlaying();
    });
});

function updateNowPlaying() {
    const active = document.querySelector('.song-item.active .song-name');
    if (active && npText) npText.textContent = '▶ ' + active.textContent;
}

// Auto-update playing state
if (bgAudio) {
    bgAudio.addEventListener('play', () => {
        isPlaying = true;
        musicBtn.classList.add('playing');
        updateNowPlaying();
    });
    bgAudio.addEventListener('pause', () => {
        isPlaying = false;
        musicBtn.classList.remove('playing');
    });
    bgAudio.addEventListener('error', (e) => {
        console.warn('Audio error - có thể chưa có file mp3:', e);
        if (npText) npText.textContent = '⚠️ Đặt file hanee.mp3 vào thư mục!';
        isPlaying = false;
        musicBtn.classList.remove('playing');
    });
}

// ===================================================================
// ===== STARS CANVAS ================================================
// ===================================================================
function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let mouse = { x: null, y: null };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.hue = 340 + Math.random() * 40;
        }
        update(t) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.curOpacity = this.opacity * (0.5 + 0.5 * Math.sin(t * this.twinkleSpeed + this.twinklePhase));
            if (mouse.x !== null) {
                const dx = mouse.x - this.x, dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) { this.x -= dx * 0.008; this.y -= dy * 0.008; }
            }
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue},80%,75%,${this.curOpacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 14000));
    for (let i = 0; i < count; i++) stars.push(new Star());

    function connect() {
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255,75,110,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    let t = 0;
    (function animate() {
        t++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => { s.update(t); s.draw(); });
        connect();
        requestAnimationFrame(animate);
    })();
}

// ===================================================================
// ===== FLOATING HEARTS =============================================
// ===================================================================
function startFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    if (!container) return;
    const emojis = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '🌹', '✨', '🦋'];
    function create() {
        const el = document.createElement('span');
        el.classList.add('floating-heart');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (Math.random() * 1.5 + 0.7) + 'rem';
        el.style.setProperty('--dur', (Math.random() * 5 + 7) + 's');
        el.style.setProperty('--del', '0s');
        el.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
        container.appendChild(el);
        setTimeout(() => el.remove(), 13000);
    }
    setInterval(create, 900);
}

// ===================================================================
// ===== ROSE PETALS =================================================
// ===================================================================
function startRosePetals() {
    const container = document.getElementById('rose-petals');
    if (!container) return;
    function create() {
        const el = document.createElement('div');
        el.classList.add('petal');
        el.style.left = Math.random() * 100 + '%';
        el.style.setProperty('--dur', (Math.random() * 6 + 8) + 's');
        el.style.setProperty('--del', '0s');
        el.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
        el.style.background = `hsl(${340 + Math.random() * 30},80%,65%)`;
        el.style.width = (Math.random() * 8 + 8) + 'px';
        el.style.height = (Math.random() * 8 + 8) + 'px';
        container.appendChild(el);
        setTimeout(() => el.remove(), 15000);
    }
    setInterval(create, 1200);
}

// ===================================================================
// ===== WELCOME TITLE ANIMATION =====================================
// ===================================================================
function animateWelcomeTitle() {
    const title = document.getElementById('welcome-title');
    if (!title) return;
    const text = 'Em Ơi...';
    title.innerHTML = '';
    [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--cd', (i * 0.12 + 0.5) + 's');
        title.appendChild(span);
    });
}

// ===================================================================
// ===== TITLE SPARKLES ==============================================
// ===================================================================
function createTitleSparkles() {
    const container = document.getElementById('title-sparkles');
    if (!container) return;
    const sparkles = ['✦', '✧', '⋆', '✨', '·'];
    for (let i = 0; i < 15; i++) {
        const s = document.createElement('span');
        s.classList.add('sparkle');
        s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.animationDelay = (Math.random() * 3) + 's';
        s.style.animationDuration = (Math.random() * 2 + 1) + 's';
        s.style.color = `hsl(${340 + Math.random() * 40},80%,70%)`;
        container.appendChild(s);
    }
}

// ===================================================================
// ===== ENVELOPE ====================================================
// ===================================================================
const envelope = document.getElementById('envelope');
const scrollHint = document.getElementById('scroll-hint');

if (envelope) {
    envelope.addEventListener('click', () => {
        envelope.classList.toggle('opened');
        if (envelope.classList.contains('opened') && scrollHint) {
            setTimeout(() => { scrollHint.style.display = 'block'; }, 800);
            // Try playing music on first user interaction
            if (!isPlaying && bgAudio) {
                bgAudio.play().then(() => {
                    isPlaying = true;
                    musicBtn.classList.add('playing');
                    updateNowPlaying();
                }).catch(() => {
                    // Audio file not available yet — that's ok
                });
            }
        }
    });
}

// ===================================================================
// ===== DATE DISPLAY ================================================
// ===================================================================
const dateEl = document.getElementById('current-date');
if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ===================================================================
// ===== TYPEWRITER — Fixed newlines =================================
// ===================================================================
const typewriterContent = [
    { text: 'Em yêu,', type: 'line' },
    { type: 'break' },
    { text: 'Anh không biết bắt đầu từ đâu, vì mỗi khi nghĩ về em, trái tim anh lại đập nhanh hơn bình thường...', type: 'line' },
    { type: 'break' },
    { text: 'Từ lần đầu gặp em, anh đã biết em là người đặc biệt. Nụ cười của em sáng như ánh mặt trời, và đôi mắt em khiến anh muốn nhìn mãi không thôi.', type: 'line' },
    { type: 'break' },
    { text: '"Nơi này có anh..." — nơi nào có em, nơi đó là nhà của anh.', type: 'line' },
    { type: 'break' },
    { text: 'Anh muốn nói với em rằng: Em là người quan trọng nhất trong cuộc đời anh. Anh muốn được nắm tay em, đi cùng em trên mọi con đường.', type: 'line' },
    { type: 'break' },
    { text: 'Anh yêu em... rất nhiều! 💕', type: 'line' },
];

let typeIndex = 0;        // index trong typewriterContent
let charIndex = 0;        // index ký tự trong text hiện tại
let isTyping = false;

function typeWriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    if (typeIndex >= typewriterContent.length) {
        // Done — hide cursor
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.style.display = 'none';
        return;
    }

    const item = typewriterContent[typeIndex];

    if (item.type === 'break') {
        el.appendChild(document.createElement('br'));
        el.appendChild(document.createElement('br'));
        typeIndex++;
        charIndex = 0;
        setTimeout(typeWriter, 150);
        return;
    }

    // type === 'line'
    if (charIndex < item.text.length) {
        // Append one character as text node (safe, no XSS)
        const char = item.text.charAt(charIndex);
        el.lastChild && el.lastChild.nodeType === 3
            ? (el.lastChild.textContent += char)
            : el.appendChild(document.createTextNode(char));
        charIndex++;
        setTimeout(typeWriter, 25 + Math.random() * 25);
    } else {
        // Move to next item
        typeIndex++;
        charIndex = 0;
        setTimeout(typeWriter, 80);
    }
}

// ===================================================================
// ===== INTERSECTION OBSERVER — Fade-in + Typewriter trigger ========
// ===================================================================
const fadeElements = document.querySelectorAll('.fade-in');
const loveLetterSection = document.getElementById('love-letter');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(el => fadeObserver.observe(el));

// Separate observer just for typewriter trigger
if (loveLetterSection) {
    const typewriterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isTyping) {
                isTyping = true;
                // Make sure the letter-container also gets visible class
                const container = loveLetterSection.querySelector('.letter-container');
                if (container) container.classList.add('visible');
                setTimeout(typeWriter, 700);
            }
        });
    }, { threshold: 0.2 });
    typewriterObserver.observe(loveLetterSection);
}

// ===================================================================
// ===== NAVIGATION DOTS =============================================
// ===================================================================
const navDots = document.querySelectorAll('.nav-dot');
const allSections = document.querySelectorAll('.section');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
            navDots.forEach(dot => {
                dot.classList.toggle('active', dot.getAttribute('href') === '#' + entry.target.id);
            });
        }
    });
}, { threshold: 0.4 });

allSections.forEach(s => {
    if (s.id) sectionObserver.observe(s);
});

// ===================================================================
// ===== TIMELINE FILL ===============================================
// ===================================================================
const timelineFill = document.getElementById('timeline-fill');
const timelineSection = document.getElementById('timeline');
if (timelineFill && timelineSection) {
    window.addEventListener('scroll', () => {
        const rect = timelineSection.getBoundingClientRect();
        const sectionH = timelineSection.offsetHeight;
        const viewH = window.innerHeight;
        if (rect.top < viewH && rect.bottom > 0) {
            const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (sectionH + viewH * 0.5)));
            timelineFill.style.height = (progress * 100) + '%';
        }
    }, { passive: true });
}

// ===================================================================
// ===== LOVE COUNTER — Fixed circumference ==========================
// ===================================================================
// SVG: r=54 → circumference = 2π×54 ≈ 339.292
const SVG_R = 54;
const CIRCUMFERENCE = 2 * Math.PI * SVG_R; // 339.292

const startDate = new Date(2024, 0, 1); // ← Đổi ngày này thành ngày bạn yêu nhau

function updateCounter() {
    const now = new Date();
    const diff = Math.max(0, now - startDate);
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    setCounter('counter-days',    days,    'ring-days',    (days % 365) / 365);
    setCounter('counter-hours',   hours,   'ring-hours',   hours / 24);
    setCounter('counter-minutes', minutes, 'ring-minutes', minutes / 60);
    setCounter('counter-seconds', seconds, 'ring-seconds', seconds / 60);
}

function setCounter(numId, value, ringId, progress) {
    const numEl = document.getElementById(numId);
    const ringEl = document.getElementById(ringId);
    if (numEl && numEl.textContent !== String(value)) {
        numEl.textContent = value;
        numEl.style.transition = 'transform .2s';
        numEl.style.transform = 'scale(1.15)';
        setTimeout(() => { numEl.style.transform = 'scale(1)'; }, 200);
    }
    if (ringEl) {
        const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 1));
        ringEl.style.strokeDasharray = CIRCUMFERENCE;
        ringEl.style.strokeDashoffset = offset;
    }
}

setInterval(updateCounter, 1000);
updateCounter();

// ===================================================================
// ===== YES / NO BUTTONS ============================================
// ===================================================================
const yesBtn = document.getElementById('yes-btn');
const noBtn  = document.getElementById('no-btn');
let noCount = 0;
const noMsgs = [
    'Suy nghĩ lại đi mà 🥺',
    'Em chắc chưa? 😢',
    'Anh buồn lắm... 😭',
    "Nhấn 'Có' đi em ơi 💕",
    'Em ơi đừng mà 🥹',
    'Anh sẽ đợi em! 💗',
    'Nhìn nút kia kìa... 👉💕',
    'Em thật sự muốn từ chối sao? 😿'
];

if (noBtn) {
    noBtn.addEventListener('click', () => {
        noCount++;
        const btnText = noBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = noMsgs[Math.min(noCount - 1, noMsgs.length - 1)];
        if (yesBtn) {
            const scale = Math.min(1 + noCount * 0.15, 2.2);
            yesBtn.style.transform = `scale(${scale})`;
        }
        if (noCount >= 2) {
            const maxX = window.innerWidth - noBtn.offsetWidth - 40;
            const maxY = window.innerHeight - noBtn.offsetHeight - 40;
            noBtn.style.position = 'fixed';
            noBtn.style.left = Math.max(0, Math.random() * maxX) + 'px';
            noBtn.style.top  = Math.max(0, Math.random() * maxY) + 'px';
            noBtn.style.zIndex = '9000';
            noBtn.style.transition = 'left .15s, top .15s, transform .3s';
        }
        if (noCount >= 4) noBtn.style.transform = `scale(${Math.max(0.5, 1 - (noCount - 3) * 0.1)})`;
        if (noCount >= 7) noBtn.style.opacity = '0.25';
    });

    noBtn.addEventListener('mouseenter', () => {
        if (noCount >= 3) {
            const maxX = window.innerWidth - noBtn.offsetWidth - 40;
            const maxY = window.innerHeight - noBtn.offsetHeight - 40;
            noBtn.style.left = Math.max(0, Math.random() * maxX) + 'px';
            noBtn.style.top  = Math.max(0, Math.random() * maxY) + 'px';
        }
    });
}

if (yesBtn) {
    yesBtn.addEventListener('click', () => {
        const questionSec = document.getElementById('question');
        if (questionSec) questionSec.style.display = 'none';
        if (noBtn) noBtn.style.display = 'none';

        const celeb = document.getElementById('celebration');
        if (celeb) {
            celeb.style.display = 'flex';
            celeb.scrollIntoView({ behavior: 'smooth' });
        }
        launchFireworks();
        launchConfetti();

        // Play music on celebration
        if (!isPlaying && bgAudio) {
            bgAudio.play().catch(() => {});
        }
    });
}

// ===================================================================
// ===== CONFETTI ====================================================
// ===================================================================
function launchConfetti() {
    const colors = ['#ff4b6e','#ff7eb3','#ffd700','#ff9a9e','#fad0c4','#a18cd1','#fbc2eb'];
    for (let i = 0; i < 120; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.classList.add('confetti-piece');
            c.style.left = Math.random() * 100 + 'vw';
            c.style.background = colors[Math.floor(Math.random() * colors.length)];
            c.style.width  = (Math.random() * 10 + 5) + 'px';
            c.style.height = (Math.random() * 10 + 5) + 'px';
            c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            c.style.setProperty('--fd',   (Math.random() * 3 + 2) + 's');
            c.style.setProperty('--fdel', (Math.random() * 1.5) + 's');
            c.style.setProperty('--dx',   (Math.random() * 200 - 100) + 'px');
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 6000);
        }, Math.random() * 800);
    }
    setTimeout(launchConfetti, 4500);
}

// ===================================================================
// ===== FIREWORKS ===================================================
// ===================================================================
function launchFireworks() {
    const colors = ['#ff4b6e','#ffd700','#ff7eb3','#a18cd1','#00ff88','#00d4ff','#fbc2eb'];
    function burst() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.5) + 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.classList.add('fw-p');
            p.style.left = x + 'px';
            p.style.top  = y + 'px';
            p.style.background = color;
            p.style.boxShadow = `0 0 6px ${color}`;
            const angle = (Math.PI * 2 * i) / 28;
            const vel = 40 + Math.random() * 70;
            p.style.setProperty('--tx', (Math.cos(angle) * vel) + 'px');
            p.style.setProperty('--ty', (Math.sin(angle) * vel) + 'px');
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1500);
        }
    }
    for (let i = 0; i < 4; i++) setTimeout(burst, i * 500);
    setTimeout(launchFireworks, 3500);
}

// ===================================================================
// ===== CLICK HEART EFFECT ==========================================
// ===================================================================
document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('nav')) return;
    const h = document.createElement('span');
    h.textContent = ['❤️','💕','💖','✨'][Math.floor(Math.random() * 4)];
    h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;font-size:1.5rem;pointer-events:none;z-index:9999;transition:all 1s ease-out;opacity:1;transform:scale(1);`;
    document.body.appendChild(h);
    // Must be in next frame for transition to work
    requestAnimationFrame(() => requestAnimationFrame(() => {
        h.style.transform = `translateY(-90px) scale(0.2) rotate(${Math.random() * 60 - 30}deg)`;
        h.style.opacity = '0';
    }));
    setTimeout(() => h.remove(), 1100);
});

// ===================================================================
// ===== PARALLAX ====================================================
// ===================================================================
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const canvas = document.getElementById('stars-canvas');
    if (canvas) canvas.style.transform = `translateY(${y * 0.12}px)`;
    const aurora = document.getElementById('aurora');
    if (aurora) aurora.style.transform = `translateY(${y * 0.08}px)`;
}, { passive: true });

// ===================================================================
// ===== PLAYLIST PANEL — hover/click toggle on mobile ==============
// ===================================================================
const musicPlayer = document.getElementById('music-player');
const playlistPanel = document.getElementById('playlist-panel');
if (musicBtn && playlistPanel) {
    // Desktop: hover handled by CSS; Mobile: click toggle
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playlistPanel.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
        if (!musicPlayer.contains(e.target)) {
            playlistPanel.classList.remove('show');
        }
    });
}

// ===================================================================
// ===== CONSOLE =====================================================
// ===================================================================
console.log('%c💕 Trang web tỏ tình 💕', 'font-size:18px;color:#ff4b6e;font-family:cursive');
console.log('%c🎵 Đặt file hanee.mp3 vào thư mục để nghe nhạc!', 'font-size:13px;color:#ffd700');
