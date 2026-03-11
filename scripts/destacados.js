/**
 * JoCar Automóviles — Sección "Lo Más Destacado" dinámica
 *
 * Carga los vehículos disponibles desde Sanity y elige hasta 8 de forma
 * aleatoria pero determinista usando el número de semana del año como
 * semilla. Así la selección cambia automáticamente cada lunes sin
 * ninguna intervención manual.
 *
 * Requiere: sanity-config.js (sanityFetch, sanityImg)
 */
(function () {
    'use strict';

    const CARD_COUNT  = 6;
    const WA_NUMBER   = '34610090974';

    // ── Semilla semanal ──────────────────────────────────────────────────────
    // Basada en el número de semana ISO del año: cambia cada lunes.
    function getWeekSeed() {
        const d         = new Date();
        const startYear = new Date(d.getFullYear(), 0, 1);
        const week      = Math.floor((d - startYear) / (7 * 24 * 60 * 60 * 1000));
        return d.getFullYear() * 100 + week;
    }

    // ── PRNG determinista — Mulberry32 ───────────────────────────────────────
    function seededRng(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t     = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function seededShuffle(arr, seed) {
        const rng  = seededRng(seed);
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // ── Utilidades ───────────────────────────────────────────────────────────
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;');
    }

    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    function formatPrice(precio) {
        return precio != null
            ? Math.round(Number(precio)).toLocaleString('es-ES') + '\u00a0\u20ac'
            : '\u2014';
    }

    const WA_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    // ── Construcción de tarjeta ──────────────────────────────────────────────
    function buildCard(car, index) {
        const delay  = (index * 0.05).toFixed(2);
        const imgUrl = car.mainImage
            ? sanityImg(car.mainImage.src, { w: 600, h: 450, fit: 'crop', q: 80, hotspot: car.mainImage.hotspot })
            : null;

        const imgHtml = imgUrl
            ? `<img src="${imgUrl}" alt="${escapeHtml(car.title)}" loading="lazy">`
            : `<div class="car-placeholder"><i data-lucide="car" size="48"></i><span>${escapeHtml(car.title)}</span></div>`;

        const specs = [
            car.año        ? `<div class="spec-item"><i data-lucide="calendar" size="16"></i> ${escapeHtml(String(car.año))}</div>`              : '',
            car.km != null ? `<div class="spec-item"><i data-lucide="gauge"    size="16"></i> ${Number(car.km).toLocaleString('es-ES')} km</div>` : '',
            car.cv         ? `<div class="spec-item"><i data-lucide="zap"      size="16"></i> ${escapeHtml(String(car.cv))} CV</div>`             : '',
            car.combustible? `<div class="spec-item"><i data-lucide="fuel"     size="16"></i> ${escapeHtml(capitalize(car.combustible))}</div>`   : '',
        ].filter(Boolean).slice(0, 4).join('');

        const subtitle = car.ivaDed
            ? 'IVA DEDUCIBLE INCLUIDO'
            : escapeHtml(car.subtitle || '');

        const waMsg = encodeURIComponent(
            `Hola, me interesa el ${car.title} a ${formatPrice(car.precio)}`
        );

        return `<article class="car-card animate-on-scroll" data-id="${escapeHtml(car.id)}" style="transition-delay:${delay}s;">
                        <div class="car-image-wrapper">
                            ${imgHtml}
                            <div class="car-tags"></div>
                        </div>
                        <div class="car-content">
                            <h3 class="car-title">${escapeHtml(car.title)}</h3>
                            <div class="car-price">${formatPrice(car.precio)}</div>
                            ${subtitle ? `<div class="car-subtitle">${subtitle}</div>` : ''}
                            <div class="car-specs">${specs}</div>
                            <a href="https://wa.me/${WA_NUMBER}?text=${waMsg}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width:100%;">
                                ${WA_SVG} Me interesa
                            </a>
                        </div>
                    </article>`;
    }

    // ── Esqueleto de carga (shimmer) ─────────────────────────────────────────
    function showSkeletons(grid) {
        const skel = `<div class="car-card dest-skel">
                        <div class="dest-skel-img dest-skel-pulse"></div>
                        <div class="car-content">
                            <div class="dest-skel-pulse dest-skel-line" style="width:70%;height:1.1rem;margin-bottom:.5rem;"></div>
                            <div class="dest-skel-pulse dest-skel-line" style="width:45%;height:1.6rem;margin-bottom:.5rem;"></div>
                            <div class="dest-skel-pulse dest-skel-line" style="width:60%;height:.7rem;margin-bottom:1rem;"></div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1rem;">
                                <div class="dest-skel-pulse dest-skel-line" style="height:.85rem;"></div>
                                <div class="dest-skel-pulse dest-skel-line" style="height:.85rem;"></div>
                                <div class="dest-skel-pulse dest-skel-line" style="height:.85rem;"></div>
                                <div class="dest-skel-pulse dest-skel-line" style="height:.85rem;"></div>
                            </div>
                            <div class="dest-skel-pulse dest-skel-line" style="width:100%;height:2.4rem;border-radius:8px;"></div>
                        </div>
                    </div>`;
        grid.innerHTML = Array(CARD_COUNT).fill(skel).join('');
    }

    // ── Inicializar interactividad en las nuevas tarjetas ────────────────────
    function initNewCards(grid) {
        // Animación al hacer scroll (IntersectionObserver propio)
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        grid.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));

        // Clic en tarjeta → página de detalle
        grid.querySelectorAll('.car-card[data-id]').forEach(card => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('.btn-whatsapp')) return;
                window.location.href = `pages/vehiculo.html?id=${card.dataset.id}`;
            });
        });

        // Regenerar iconos Lucide para los nuevos elementos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ── Punto de entrada ─────────────────────────────────────────────────────
    async function loadDestacados() {
        const grid = document.querySelector('#stock .car-grid');
        if (!grid) return;

        showSkeletons(grid);

        try {
            const query = `*[_type == "vehiculo" && disponible != false] | order(_createdAt desc) {
                "id": slug.current,
                title, subtitle, combustible,
                "año": anio,
                km, precio, cv, ivaDed,
                "mainImage": images[0] { "src": asset->url, "hotspot": hotspot }
            }`;

            const cars = await sanityFetch(query);

            if (!cars || cars.length === 0) {
                grid.innerHTML = '<p class="dest-empty">Próximamente nuevos vehículos disponibles.</p>';
                return;
            }

            const selected = seededShuffle(cars, getWeekSeed()).slice(0, CARD_COUNT);
            grid.innerHTML  = selected.map((car, i) => buildCard(car, i)).join('');
            initNewCards(grid);

        } catch (err) {
            console.warn('[JoCar] No se pudo cargar el stock destacado:', err);
            grid.innerHTML = '<p class="dest-empty">Próximamente nuevos vehículos disponibles.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', loadDestacados);
}());
