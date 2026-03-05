/* ============================================================
   VEHICULO.JS — Lógica de la página de detalle del vehículo
   Depende de: carData.js (CAR_DATA, getCarById, getSimilarCars)
   ============================================================ */

(function () {
    'use strict';

    /* ── 1. Obtener el ID del coche por query param ──────── */
    const params = new URLSearchParams(window.location.search);
    const carId  = params.get('id');
    const car    = carId ? getCarById(carId) : null;

    if (!car) {
        // Si no existe el ID → redirigir al stock
        window.location.href = 'stock.html';
        return;
    }

    /* ── 2. Helpers de formato ───────────────────────────── */
    const fmt = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    const fmtKm = n => n.toLocaleString('es-ES') + ' km';

    /* ── 3. SEO y título ─────────────────────────────────── */
    document.getElementById('pageTitle').textContent = `${car.title} | JC Autos de Ocasión`;
    document.getElementById('pageDesc').setAttribute('content',
        `${car.title} — ${car.subtitle}. Precio: ${fmt(car.precio)}. JC Autos de Ocasión, Dos Hermanas.`);

    /* ── 4. Breadcrumb ───────────────────────────────────── */
    document.getElementById('bcTitle').textContent = car.title;

    /* ── 5. Hero info ────────────────────────────────────── */
    document.getElementById('brandTag').textContent = car.marca.toUpperCase();
    document.getElementById('carTitle').textContent = car.title;
    document.getElementById('carSubtitle').textContent = car.subtitle;

    // Quick specs
    document.getElementById('qs-year').textContent = car.año;
    document.getElementById('qs-km').textContent   = fmtKm(car.km);
    document.getElementById('qs-cv').textContent   = `${car.cv} CV`;
    document.getElementById('qs-comb').textContent = capitalize(car.combustible);
    document.getElementById('qs-cambio').textContent = car.cambio;
    document.getElementById('qs-trac').textContent  = car.traccion;

    // Precio
    document.getElementById('priceMain').textContent = fmt(car.precio);
    document.getElementById('priceNote').textContent = car.ivaDed
        ? 'IVA deducible para empresas y autónomos'
        : 'Precio de venta al público — IVA incluido';

    // Tag IVA en detail tags
    const tagIva = document.getElementById('tagIva');
    if (car.ivaDed) {
        tagIva.innerHTML = '<svg data-lucide="receipt" width="13" height="13"></svg> IVA deducible';
    } else {
        tagIva.innerHTML = '<svg data-lucide="check-circle" width="13" height="13"></svg> IVA incluido';
    }

    // Descripción
    document.getElementById('carDescription').textContent = car.description;

    /* ── 6. WhatsApp ─────────────────────────────────────── */
    const waText = encodeURIComponent(`¡Hola! Me interesa el ${car.title} ${car.año} a ${fmt(car.precio)} que vi en vuestra web. ¿Está disponible?`);
    const waUrl  = `https://wa.me/34610090974?text=${waText}`;
    document.getElementById('btnWhatsApp').href = waUrl;
    document.getElementById('calcWhatsApp').href = waUrl;
    document.getElementById('ctaWhatsApp').href  = waUrl;

    /* ── 7. Galería de imágenes ──────────────────────────── */
    const images = (car.images || []).filter(img => img.src); // solo las que tienen src
    let currentIdx = 0;

    const mainImgWrap = document.getElementById('mainImgWrap');
    const mainImg     = document.getElementById('mainImg');
    const counter     = document.getElementById('photoCounter');
    const thumbsEl    = document.getElementById('thumbnails');
    const prevBtn     = document.getElementById('galleryPrev');
    const nextBtn     = document.getElementById('galleryNext');

    function showImage(idx) {
        if (images.length === 0) {
            // Sin imágenes: mostrar placeholder
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
        mainImg.src = img.src;
        mainImg.alt = img.alt || car.title;
        mainImg.style.display = 'block';
        counter.textContent = `${currentIdx + 1} / ${images.length}`;
        // Activar miniatura
        document.querySelectorAll('.veh-thumb').forEach((th, i) => {
            th.classList.toggle('active', i === currentIdx);
        });
        lucide.createIcons();
    }

    // Construir miniaturas
    images.forEach((img, i) => {
        const th = document.createElement('div');
        th.className = 'veh-thumb' + (i === 0 ? ' active' : '');
        th.innerHTML = `<img src="${img.src}" alt="${img.alt || car.title}" loading="lazy">`;
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

    // Click en imagen = lightbox
    mainImgWrap.addEventListener('click', function (e) {
        if (e.target === prevBtn || prevBtn.contains(e.target)) return;
        if (e.target === nextBtn || nextBtn.contains(e.target)) return;
        if (images.length > 0) openLightbox(images[currentIdx].src, images[currentIdx].alt || car.title);
    });

    // Teclado ← →
    document.addEventListener('keydown', function (e) {
        if (document.getElementById('lightbox').classList.contains('active')) return;
        if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
        if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });

    showImage(0);

    /* ── 8. Ficha técnica ────────────────────────────────── */
    const specsTable = document.getElementById('specsTable');
    const allSpecs = {
        'Año': car.año,
        'Kilómetros': fmtKm(car.km),
        'Potencia': `${car.cv} CV`,
        'Combustible': capitalize(car.combustible),
        'Cambio': car.cambio,
        'Tracción': car.traccion,
        'Cilindrada': car.cilindrada ? `${car.cilindrada} cc` : '—',
        'Puertas': car.puertas,
        'Plazas': car.plazas,
        'Color': car.color,
        ...car.specs,
    };

    Object.entries(allSpecs).forEach(([key, val]) => {
        if (!val && val !== 0) return;
        const row = document.createElement('div');
        row.className = 'spec-row';
        row.innerHTML = `<span class="spec-key">${key}</span><span class="spec-val">${val}</span>`;
        specsTable.appendChild(row);
    });

    /* ── 9. Equipamiento por categoría ──────────────────── */
    const equipGrid = document.getElementById('equipmentGrid');
    const catIcons  = {
        'Confort & Tecnología': 'armchair',
        'Seguridad': 'shield',
        'Exterior': 'star',
        'Audio': 'music-2',
        'Interior': 'layout-dashboard',
        'Iluminación': 'lamp',
        'Asistencias conducción': 'navigation',
        'Conectividad': 'wifi',
    };

    if (car.equipment && Object.keys(car.equipment).length > 0) {
        Object.entries(car.equipment).forEach(([cat, items], idx) => {
            const icon = catIcons[cat] || 'settings';
            const section = document.createElement('div');
            section.className = 'equip-category' + (idx < 2 ? ' open' : '');
            section.innerHTML = `
                <div class="equip-cat-header" role="button" tabindex="0">
                    <span class="equip-cat-name">
                        <i data-lucide="${icon}" size="15"></i>
                        ${cat}
                    </span>
                    <span class="equip-cat-count">${items.length}</span>
                    <i data-lucide="chevron-down" size="16" class="equip-cat-chevron"></i>
                </div>
                <div class="equip-items">
                    ${items.map(item => `<div class="equip-item">${item}</div>`).join('')}
                </div>
            `;
            // Toggle accordion
            const header = section.querySelector('.equip-cat-header');
            header.addEventListener('click', () => section.classList.toggle('open'));
            header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') section.classList.toggle('open'); });
            equipGrid.appendChild(section);
        });
    } else {
        equipGrid.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Información de equipamiento no disponible.</p>';
    }

    /* ── 10. Calculadora financiera ──────────────────────── */
    const entradaEl = document.getElementById('calcEntrada');
    const plazoEl   = document.getElementById('calcPlazo');
    const tinEl     = document.getElementById('calcTin');

    document.getElementById('calcCarPrice').textContent = fmt(car.precio);

    function calcularCuota() {
        const entrada     = parseFloat(entradaEl.value) / 100;
        const n           = parseInt(plazoEl.value);
        const tinAnual    = parseFloat(tinEl.value) / 100;
        const capital     = car.precio * (1 - entrada);
        const entradaEur  = car.precio * entrada;
        const r           = tinAnual / 12;

        /* Fórmula amortización francesa */
        let cuota;
        if (r === 0) {
            cuota = capital / n;
        } else {
            cuota = capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const totalPagado = cuota * n + entradaEur;
        const costeFin    = totalPagado - car.precio;

        // TAE aproximada (mensual → anual)
        const tae = (Math.pow(1 + r, 12) - 1) * 100;

        // Actualizar displays
        document.getElementById('entradaDisplay').textContent =
            `${entradaEl.value}% (${fmt(entradaEur)})`;
        document.getElementById('plazoDisplay').textContent = `${n} meses`;
        document.getElementById('tinDisplay').textContent   = `${parseFloat(tinEl.value).toFixed(2).replace('.', ',')}%`;

        document.getElementById('calcCapital').textContent  = fmt(capital);
        document.getElementById('calcPlazoRes').textContent = `${n} meses`;
        document.getElementById('calcTaeRes').textContent   = `TIN ${parseFloat(tinEl.value).toFixed(2).replace('.', ',')}% / TAE ${tae.toFixed(2).replace('.', ',')}%`;
        document.getElementById('calcMonthly').textContent  = `${fmt(cuota)}/mes`;
        document.getElementById('calcTotal').textContent    = fmt(Math.round(totalPagado));

        // Actualizar preview en info panel
        document.getElementById('previewMonthly').textContent = fmt(Math.round(cuota));

        return Math.round(cuota);
    }

    entradaEl.addEventListener('input', calcularCuota);
    plazoEl.addEventListener('input', calcularCuota);
    tinEl.addEventListener('input', calcularCuota);

    // Cálculo inicial
    calcularCuota();

    /* ── 11. Vehículos similares ─────────────────────────── */
    const similarGrid  = document.getElementById('similarGrid');
    const similares    = getSimilarCars(car, 4);

    if (similares.length > 0) {
        similares.forEach(s => {
            const imgSrc = s.images && s.images[0] && s.images[0].src ? s.images[0].src : null;
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
                    <div class="similar-sub">${s.subtitle}</div>
                    <div class="similar-meta">
                        <span>${s.año}</span>
                        <span>${fmtKm(s.km)}</span>
                        <span>${s.cv} CV</span>
                    </div>
                    <div class="similar-price">${fmt(s.precio)}</div>
                </div>
            `;
            similarGrid.appendChild(card);
        });
    } else {
        similarGrid.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No hay vehículos similares disponibles.</p>';
    }

    /* ── 12. Re-inicializar iconos Lucide ────────────────── */
    lucide.createIcons();

    /* ── 13. Helpers ─────────────────────────────────────── */
    function capitalize(str) {
        if (!str) return '—';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /* ── Lightbox functions (globales para onclick inline) ── */
    window.openLightbox = function (src, alt) {
        const lb = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    };

    window.closeLightbox = function () {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    /* ── Scroll a calculadora ─────────────────────────────── */
    window.scrollToCalc = function () {
        const target = document.getElementById('calcTarget');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

})();
