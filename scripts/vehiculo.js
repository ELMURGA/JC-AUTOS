/* ============================================================
   VEHICULO.JS — Lógica de la página de detalle del vehículo
   Depende de: sanity-config.js (sanityFetch, sanityImg)
   ============================================================ */

(function () {
    'use strict';

    /* ── 1. Obtener el ID del coche por query param ──────── */
    const params = new URLSearchParams(window.location.search);
    const carId  = params.get('id');

    if (!carId) {
        window.location.href = 'stock.html';
        return;
    }

    /* ── 2. Helpers de formato ───────────────────────────── */
    const fmt   = n => n != null ? n.toLocaleString('es-ES') + ' €' : '—';
    const fmtKm = n => n.toLocaleString('es-ES') + ' km';

    function capitalize(str) {
        if (!str) return '—';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /* ── 3. Consultas GROQ ───────────────────────────────── */
    const GROQ_CAR = `
        *[_type == "vehiculo" && slug.current == $id][0] {
            "id":        slug.current,
            title,
            subtitle,
            marca,
            modelo,
            combustible,
            "año":       anio,
            km,
            precio,
            cv,
            cilindrada,
            cambio,
            traccion,
            puertas,
            plazas,
            color,
            ivaDed,
            "images":    images[]{ "src": asset->url, alt, hotspot },
            description,
            "specs":     specs[]{ key, value },
            "equipment": equipment[]{ category, items }
        }`;

    const GROQ_SIMILAR = `
        *[_type == "vehiculo" && slug.current != $id && disponible != false][0...20] {
            "id":        slug.current,
            title,
            subtitle,
            marca,
            combustible,
            "año":       anio,
            km,
            precio,
            cv,
            "mainImage": images[0] { "src": asset->url, "hotspot": hotspot }
        }`;

    /* ── 4. Cargar y renderizar el vehículo ──────────────── */
    Promise.all([
        sanityFetch(GROQ_CAR,     { id: carId }),
        sanityFetch(GROQ_SIMILAR, { id: carId }),
    ])
    .then(([car, allOthers]) => {
        if (!car) {
            window.location.href = 'stock.html';
            return;
        }
        renderCar(car);
        renderSimilar(car, allOthers || []);
    })
    .catch(err => {
        console.error('[JoCar] Error cargando vehículo:', err);
        window.location.href = 'stock.html';
    });

    /* ════════════════════════════════════════════════════════
       RENDER PRINCIPAL
       ════════════════════════════════════════════════════════ */
    function renderCar(car) {

        /* ── SEO y título ────────────────────────────────────── */
        document.getElementById('pageTitle').textContent = `${car.title} | JoCar Automóviles`;
        document.getElementById('pageDesc').setAttribute('content',
            `${car.title} — ${car.subtitle}. Precio: ${fmt(car.precio)}. JoCar Automóviles, Dos Hermanas.`);

        /* ── Breadcrumb ──────────────────────────────────────── */
        document.getElementById('bcTitle').textContent = car.title;

        /* ── Hero info ───────────────────────────────────────── */
        document.getElementById('brandTag').textContent    = car.marca.toUpperCase();
        document.getElementById('carTitle').textContent    = car.title;
        document.getElementById('carSubtitle').textContent = car.subtitle;

        // Quick specs
        document.getElementById('qs-year').textContent   = car.año;
        document.getElementById('qs-km').textContent     = fmtKm(car.km);
        document.getElementById('qs-cv').textContent     = `${car.cv} CV`;
        document.getElementById('qs-comb').textContent   = capitalize(car.combustible);
        document.getElementById('qs-cambio').textContent = car.cambio;
        document.getElementById('qs-trac').textContent   = car.traccion;

        // Precio
        document.getElementById('priceMain').textContent = fmt(car.precio);
        document.getElementById('priceNote').textContent = car.ivaDed
            ? 'IVA deducible para empresas y autónomos'
            : 'Precio de venta al público — IVA incluido';

        // Tag IVA
        const tagIva = document.getElementById('tagIva');
        if (car.ivaDed) {
            tagIva.innerHTML = '<svg data-lucide="receipt" width="13" height="13"></svg> IVA deducible';
        } else {
            tagIva.innerHTML = '<svg data-lucide="check-circle" width="13" height="13"></svg> IVA incluido';
        }

        // Descripción
        document.getElementById('carDescription').textContent = car.description || '';

        /* ── WhatsApp ────────────────────────────────────────── */
        try {
            const waText = encodeURIComponent(`¡Hola! Me interesa el ${car.title} ${car.año} a ${fmt(car.precio)} que vi en vuestra web. ¿Está disponible?`);
            const waUrl  = `https://wa.me/34610090974?text=${waText}`;
            ['btnWhatsApp', 'calcWhatsApp', 'ctaWhatsApp', 'floatWhatsApp'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.href = waUrl;
            });
        } catch (e) {
            console.warn('[JoCar] WhatsApp URL fallback activo:', e);
        }

        /* ── Galería de imágenes (múltiples fotos) ───────────── */
        const images = (car.images || []).filter(img => img && img.src);
        let currentIdx = 0;

        const mainImgWrap = document.getElementById('mainImgWrap');
        const mainImg     = document.getElementById('mainImg');
        const counter     = document.getElementById('photoCounter');
        const thumbsEl    = document.getElementById('thumbnails');
        const prevBtn     = document.getElementById('galleryPrev');
        const nextBtn     = document.getElementById('galleryNext');

        function showImage(idx) {
            if (images.length === 0) {
                mainImg.style.display = 'none';
                if (!mainImgWrap.querySelector('.car-placeholder')) {
                    const ph = document.createElement('div');
                    ph.className = 'car-placeholder';
                    ph.innerHTML = '<i data-lucide="car" size="64"></i><span>Sin fotos disponibles</span>';
                    mainImgWrap.appendChild(ph);
                }
                counter.style.display = 'none';
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                return;
            }
            currentIdx = ((idx % images.length) + images.length) % images.length;
            const img = images[currentIdx];
            // Imagen principal en alta resolución (fit:max para no recortar en vista grande)
            mainImg.src = sanityImg(img.src, { w: 1200, h: 800, fit: 'max' }) || img.src;
            mainImg.alt = img.alt || car.title;
            mainImg.style.display = 'block';
            counter.textContent = `${currentIdx + 1} / ${images.length}`;

            document.querySelectorAll('.veh-thumb').forEach((th, i) => {
                th.classList.toggle('active', i === currentIdx);
            });
            lucide.createIcons();
        }

        // Construir miniaturas
        images.forEach((img, i) => {
            const th = document.createElement('div');
            th.className = 'veh-thumb' + (i === 0 ? ' active' : '');
            const thumbUrl = sanityImg(img.src, { w: 160, h: 110, fit: 'crop', hotspot: img.hotspot }) || img.src;
            th.innerHTML = `<img src="${thumbUrl}" alt="${img.alt || car.title}" loading="lazy">`;
            th.addEventListener('click', () => showImage(i));
            thumbsEl.appendChild(th);
        });

        // Ocultar flechas si hay 1 o menos imágenes
        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.addEventListener('click', () => showImage(currentIdx - 1));
            nextBtn.addEventListener('click', () => showImage(currentIdx + 1));
        }

        // Click en imagen principal → lightbox
        mainImgWrap.addEventListener('click', function (e) {
            if (e.target === prevBtn || prevBtn.contains(e.target)) return;
            if (e.target === nextBtn || nextBtn.contains(e.target)) return;
            if (images.length > 0) {
                const fullUrl = sanityImg(images[currentIdx].src, { w: 1920, fit: 'max' }) || images[currentIdx].src;
                openLightbox(fullUrl, images[currentIdx].alt || car.title);
            }
        });

        // Teclado ← →
        document.addEventListener('keydown', function (e) {
            if (document.getElementById('lightbox').classList.contains('active')) return;
            if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
            if (e.key === 'ArrowRight') showImage(currentIdx + 1);
        });

        showImage(0);

        /* ── Ficha técnica ───────────────────────────────────── */
        const specsTable = document.getElementById('specsTable');
        const baseSpecs = {
            'Año':        car.año,
            'Kilómetros': fmtKm(car.km),
            'Potencia':   `${car.cv} CV`,
            'Combustible': capitalize(car.combustible),
            'Cambio':     car.cambio,
            'Tracción':   car.traccion,
            'Cilindrada': car.cilindrada ? `${car.cilindrada} cc` : null,
            'Puertas':    car.puertas,
            'Plazas':     car.plazas,
            'Color':      car.color,
        };

        // Specs base + specs de Sanity
        const extraSpecs = {};
        (car.specs || []).forEach(s => { if (s.key) extraSpecs[s.key] = s.value; });
        const allSpecs = { ...baseSpecs, ...extraSpecs };

        Object.entries(allSpecs).forEach(([key, val]) => {
            if (!val && val !== 0) return;
            const row = document.createElement('div');
            row.className = 'spec-row';
            row.innerHTML = `<span class="spec-key">${key}</span><span class="spec-val">${val}</span>`;
            specsTable.appendChild(row);
        });

        /* ── Equipamiento por categoría ──────────────────────── */
        const equipGrid = document.getElementById('equipmentGrid');
        const catIcons  = {
            'Confort & Tecnología': 'armchair',
            'Seguridad':            'shield',
            'Exterior':             'star',
            'Audio':                'music-2',
            'Interior':             'layout-dashboard',
            'Iluminación':          'lamp',
            'Asistencias conducción': 'navigation',
            'Conectividad':         'wifi',
        };

        if (car.equipment && car.equipment.length > 0) {
            car.equipment.forEach((cat, idx) => {
                const icon = catIcons[cat.category] || 'settings';
                const section = document.createElement('div');
                section.className = 'equip-category' + (idx < 2 ? ' open' : '');
                section.innerHTML = `
                    <div class="equip-cat-header" role="button" tabindex="0">
                        <span class="equip-cat-name">
                            <i data-lucide="${icon}" size="15"></i>
                            ${cat.category}
                        </span>
                        <span class="equip-cat-count">${(cat.items || []).length}</span>
                        <i data-lucide="chevron-down" size="16" class="equip-cat-chevron"></i>
                    </div>
                    <div class="equip-items">
                        ${(cat.items || []).map(item => `<div class="equip-item">${item}</div>`).join('')}
                    </div>`;
                const header = section.querySelector('.equip-cat-header');
                header.addEventListener('click', () => section.classList.toggle('open'));
                header.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') section.classList.toggle('open');
                });
                equipGrid.appendChild(section);
            });
        } else {
            equipGrid.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Información de equipamiento no disponible.</p>';
        }

        /* ── Calculadora financiera ──────────────────────────── */
        const entradaEl = document.getElementById('calcEntrada');
        const plazoEl   = document.getElementById('calcPlazo');
        const tinEl     = document.getElementById('calcTin');

        document.getElementById('calcCarPrice').textContent = fmt(car.precio);

        function calcularCuota() {
            const entrada    = parseFloat(entradaEl.value) / 100;
            const n          = parseInt(plazoEl.value);
            const tinAnual   = parseFloat(tinEl.value) / 100;
            const capital    = car.precio * (1 - entrada);
            const entradaEur = car.precio * entrada;
            const r          = tinAnual / 12;

            let cuota;
            if (r === 0) {
                cuota = capital / n;
            } else {
                cuota = capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            }

            const totalPagado = cuota * n + entradaEur;
            const tae = (Math.pow(1 + r, 12) - 1) * 100;

            document.getElementById('entradaDisplay').textContent =
                `${entradaEl.value}% (${fmt(entradaEur)})`;
            document.getElementById('plazoDisplay').textContent = `${n} meses`;
            document.getElementById('tinDisplay').textContent   =
                `${parseFloat(tinEl.value).toFixed(2).replace('.', ',')}%`;

            document.getElementById('calcCapital').textContent  = fmt(capital);
            document.getElementById('calcPlazoRes').textContent = `${n} meses`;
            document.getElementById('calcTaeRes').textContent   =
                `TIN ${parseFloat(tinEl.value).toFixed(2).replace('.', ',')}% / TAE ${tae.toFixed(2).replace('.', ',')}%`;
            document.getElementById('calcMonthly').textContent  = `${fmt(Math.round(cuota))}/mes`;
            document.getElementById('calcTotal').textContent    = fmt(Math.round(totalPagado));
            document.getElementById('previewMonthly').textContent = fmt(Math.round(cuota));

            // Actualizar botón WhatsApp de la calculadora con los datos reales
            const waFinMsg = encodeURIComponent(
                `¡Hola! Estoy interesado en financiar el ${car.title} ${car.año} (${fmt(car.precio)}).\n` +
                `He calculado las siguientes condiciones:\n` +
                `- Capital a financiar: ${fmt(capital)}\n` +
                `- Plazo: ${n} meses\n` +
                `- TIN: ${parseFloat(tinEl.value).toFixed(2).replace('.', ',')}% / TAE: ${tae.toFixed(2).replace('.', ',')}%\n` +
                `- Cuota mensual aprox.: ${fmt(Math.round(cuota))}/mes\n` +
                `¿Podéis confirmarme disponibilidad y condiciones?`
            );
            const calcBtn = document.getElementById('calcWhatsApp');
            if (calcBtn) calcBtn.href = `https://wa.me/34610090974?text=${waFinMsg}`;

            return Math.round(cuota);
        }

        entradaEl.addEventListener('input', calcularCuota);
        plazoEl.addEventListener('input',   calcularCuota);
        tinEl.addEventListener('input',     calcularCuota);
        calcularCuota();

        /* ── Re-inicializar iconos Lucide ────────────────────── */
        lucide.createIcons();
    }

    /* ════════════════════════════════════════════════════════
       VEHÍCULOS SIMILARES
       ════════════════════════════════════════════════════════ */
    function renderSimilar(car, allOthers) {
        const similarGrid = document.getElementById('similarGrid');

        // Calcular puntuación de similitud (igual que el original)
        const scored = allOthers.map(s => {
            let score = 0;
            if (s.combustible === car.combustible) score += 2;
            if (s.marca       === car.marca)       score += 3;
            const priceDiff = Math.abs(s.precio - car.precio) / car.precio;
            if (priceDiff < 0.3)  score += 2;
            if (priceDiff < 0.15) score += 2;
            return { car: s, score };
        });

        const similares = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(x => x.car);

        if (similares.length > 0) {
            similares.forEach(s => {
                const imgSrc = s.mainImage
                    ? sanityImg(s.mainImage.src, { w: 400, h: 260, fit: 'crop', hotspot: s.mainImage.hotspot })
                    : null;
                const card = document.createElement('a');
                card.className = 'similar-card';
                card.href = `vehiculo.html?id=${s.id}`;
                card.innerHTML = `
                    ${imgSrc
                        ? `<img class="similar-img" src="${imgSrc}" alt="${s.title}" loading="lazy">`
                        : `<div class="similar-img-placeholder"><i data-lucide="car" size="32"></i></div>`
                    }
                    <div class="similar-body">
                        <div class="similar-title">${s.title}</div>
                        <div class="similar-sub">${s.subtitle || ''}</div>
                        <div class="similar-meta">
                            <span>${s.año}</span>
                            <span>${fmtKm(s.km)}</span>
                            <span>${s.cv} CV</span>
                        </div>
                        <div class="similar-price">${fmt(s.precio)}</div>
                    </div>`;
                similarGrid.appendChild(card);
            });
        } else {
            similarGrid.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No hay vehículos similares disponibles.</p>';
        }

        lucide.createIcons();
    }

    /* ════════════════════════════════════════════════════════
       LIGHTBOX
       ════════════════════════════════════════════════════════ */
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    window.openLightbox = function (src, alt) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function () {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightbox?.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);

    /* ════════════════════════════════════════════════════════
       HELPER scrollToCalc (usado desde el HTML)
       ════════════════════════════════════════════════════════ */
    window.scrollToCalc = function () {
        document.getElementById('calcTarget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

}());
