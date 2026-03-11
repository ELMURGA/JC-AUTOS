// Mobile menu toggle (fullscreen overlay)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenu = document.getElementById('mobileMenu');

function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Animate on scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

function revealVisible() {
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
            observer.unobserve(el);
        }
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Revelar elementos ya visibles al cargar (p.ej. al llegar desde otra página con #hash)
window.addEventListener('load', () => {
    revealVisible();
});

// Car cards → vehiculo (detecta si estamos en raíz o en pages/)
document.querySelectorAll('.car-card[data-id]').forEach(card => {
    card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-whatsapp')) return;
        const inPages = window.location.pathname.includes('/pages/');
        const prefix  = inPages ? '' : 'pages/';
        window.location.href = `${prefix}vehiculo.html?id=${card.dataset.id}`;
    });
});

// Smooth scroll for hash links (offset by navbar height)
function scrollToHash(hash, behavior = 'smooth') {
    const target = document.querySelector(hash);
    if (!target) return;
    const navbarH = document.getElementById('navbar')?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarH;
    window.scrollTo({ top, behavior });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        // Evitar SyntaxError con '#' suelto (selector inválido)
        if (!hash || hash === '#') return;
        try {
            if (document.querySelector(hash)) {
                e.preventDefault();
                scrollToHash(hash);
            }
        } catch (_) { /* selector inválido, dejar navegación por defecto */ }
    });
});

// Re-scroll tras carga completa: corrige el desfase causado por contenido dinámico
// (los coches se cargan de Sanity y expanden la grid DESPUÉS del scroll inicial)
if (window.location.hash && window.location.hash !== '#') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            try { scrollToHash(window.location.hash, 'instant'); } catch (_) {}
            revealVisible();
        }, 50);
    });
}

// bfcache: al navegar con el botón atrás/adelante el navegador restaura la página
// desde caché sin re-ejecutar los scripts. Si un menú/lightbox estaba abierto al
// salir, document.body.overflow quedaría bloqueado. Lo reseteamos aquí.
window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;  // carga normal, nada que hacer
    document.body.style.overflow = '';
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
    }
});
