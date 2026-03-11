/* JoCar Automóviles — Stock: Sanity CMS + Filtros + Lightbox
   Depende de: sanity-config.js (sanityFetch, sanityImg)
   ================================================================ */
(function () {
    'use strict';

    /* ── SVG WhatsApp reutilizable ─────────────────────────────── */
    const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

    /* ── Referencias al DOM ────────────────────────────────────── */
    const stockGrid = document.getElementById('stockGrid');
    const countEl   = document.getElementById('resultsCount');

    /* ── Dataset en memoria ────────────────────────────────────── */
    let cards = [];   // Array de { element, marca, combustible, año, km, precio, title }

    /* ── Selectores de filtros ─────────────────────────────────── */
    const selMarca   = document.getElementById('filterMarca');
    const selComb    = document.getElementById('filterCombustible');
    const selPrecio  = document.getElementById('filterPrecio');
    const selAnio    = document.getElementById('filterAnio');
    const selKm      = document.getElementById('filterKm');
    const inputSearch = document.getElementById('filterSearch');

    const filterBtn  = document.getElementById('filterBtn');
    const resetBtn   = document.getElementById('resetFilters');
    const activeFiltersContainer = document.getElementById('activeFilters');

    /* Formatea un precio siempre como número entero con separador de miles español.
       Ejemplo: 32900 → "32.900 €" | 32.9 (dato erróneo) → "33 €" */
    const fmt    = n => n != null ? Math.round(Number(n)).toLocaleString('es-ES') + ' €' : '—';
    const fmtKm  = n => Number(n).toLocaleString('es-ES') + ' km';
    const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    /* ── Skeleton de carga ─────────────────────────────────────── */
    function showLoading() {
        stockGrid.innerHTML = Array(6).fill(0).map(() => `
            <article class="car-card" style="pointer-events:none">
                <div class="car-image-wrapper" style="background:var(--surface-light);height:220px;border-radius:12px 12px 0 0;overflow:hidden">
                    <div style="width:100%;height:100%;background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
                </div>
                <div class="car-content" style="display:flex;flex-direction:column;gap:10px">
                    <div style="height:18px;width:70%;background:rgba(255,255,255,.07);border-radius:6px"></div>
                    <div style="height:26px;width:45%;background:rgba(255,255,255,.07);border-radius:6px"></div>
                    <div style="height:14px;width:90%;background:rgba(255,255,255,.05);border-radius:6px"></div>
                    <div style="height:14px;width:60%;background:rgba(255,255,255,.05);border-radius:6px"></div>
                </div>
            </article>`).join('');
    }

    /* ── Construir una tarjeta de coche ────────────────────────── */
    function buildCard(car) {
        const imgUrl = car.mainImage
            ? sanityImg(car.mainImage.src, { w: 600, h: 450, fit: 'max', hotspot: car.mainImage.hotspot })
            : null;

        const subtitleText = car.ivaDed ? 'IVA DEDUCIBLE INCLUIDO' : 'IVA INCLUIDO';
        const waText = encodeURIComponent(`Hola, me interesa el ${car.title} a ${fmt(car.precio)}`);

        const el = document.createElement('article');
        el.className = 'car-card';
        el.dataset.id          = car.id;
        el.dataset.marca       = car.marca       || '';
        el.dataset.combustible = car.combustible || '';
        el.dataset.año         = car.año         || 0;
        el.dataset.km          = car.km          || 0;
        el.dataset.precio      = car.precio      || 0;

        el.innerHTML = `
            <div class="car-image-wrapper">
                ${imgUrl
                    ? `<img src="${imgUrl}" alt="${car.title}" loading="lazy">`
                    : `<div class="car-placeholder"><i data-lucide="car" size="48"></i><span>${car.title}</span></div>`
                }
                <div class="car-tags"></div>
            </div>
            <div class="car-content">
                <h3 class="car-title">${car.title}</h3>
                <div class="car-price">${fmt(car.precio)}</div>
                <div class="car-subtitle">${subtitleText}</div>
                <div class="car-specs">
                    <div class="spec-item"><i data-lucide="calendar" size="16"></i> ${car.año}</div>
                    <div class="spec-item"><i data-lucide="gauge" size="16"></i> ${fmtKm(car.km)}</div>
                    <div class="spec-item"><i data-lucide="zap" size="16"></i> ${car.cv} CV</div>
                    <div class="spec-item"><i data-lucide="fuel" size="16"></i> ${capFirst(car.combustible)}</div>
                </div>
                <a href="https://wa.me/34610090974?text=${waText}"
                   target="_blank" rel="noopener" class="btn btn-whatsapp" style="width:100%;">
                    ${WA_SVG} Me interesa
                </a>
            </div>`;

        // Clic en tarjeta (excepto WhatsApp) → detalle del vehículo
        el.addEventListener('click', function (e) {
            if (e.target.closest('.btn-whatsapp')) return;
            window.location.href = `vehiculo.html?id=${car.id}`;
        });

        return el;
    }

    /* ── Renderizar todas las tarjetas en el DOM ───────────────── */
    function renderCards(data) {
        stockGrid.innerHTML = '';

        cards = data.map(car => {
            const el = buildCard(car);
            stockGrid.appendChild(el);
            return {
                element:     el,
                marca:       car.marca       || '',
                combustible: car.combustible || '',
                año:         car.año         || 0,
                km:          car.km          || 0,
                precio:      car.precio      || 0,
                title:       (car.title      || '').toLowerCase(),
            };
        });

        // Div "sin resultados" al final del grid
        const noResDiv = document.createElement('div');
        noResDiv.className = 'no-results';
        noResDiv.id = 'noResults';
        noResDiv.style.display = 'none';
        noResDiv.innerHTML = `
            <i data-lucide="search" size="48" style="opacity:0.2;margin-bottom:1rem;display:inline-block;"></i>
            <h3 style="color:white;font-size:1.5rem;margin-bottom:0.5rem;">No se encontraron vehículos</h3>
            <p style="font-size:1.1rem;">Ajusta los filtros para ver más resultados.</p>`;
        stockGrid.appendChild(noResDiv);

        if (typeof lucide !== 'undefined') lucide.createIcons();
        filterCars();
    }

    /* ── Función principal de filtrado ─────────────────────────── */
    function filterCars() {
        const marca     = selMarca?.value  || '';
        const comb      = selComb?.value   || '';
        const maxPrecio = selPrecio?.value ? parseInt(selPrecio.value)  : Infinity;
        const minAnio   = selAnio?.value   ? parseInt(selAnio.value)   : 0;
        const maxKm     = selKm?.value     ? parseInt(selKm.value)     : Infinity;
        const keyword   = (inputSearch?.value || '').trim().toLowerCase();

        let visible = 0;

        cards.forEach(c => {
            const ok =
                (!marca   || c.marca === marca) &&
                (!comb    || c.combustible === comb) &&
                c.precio  <= maxPrecio &&
                (c.año === 0 || c.año >= minAnio) &&
                (c.km  === 0 || c.km  <= maxKm)  &&
                (!keyword || c.title.includes(keyword));

            c.element.style.display = ok ? '' : 'none';
            if (ok) visible++;
        });

        if (countEl) countEl.textContent = visible;

        const noResEl = document.getElementById('noResults');
        if (noResEl) noResEl.style.display = visible === 0 ? 'block' : 'none';

        renderActiveTags();
    }

    /* ── Etiquetas de filtros activos ──────────────────────────── */
    function renderActiveTags() {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.innerHTML = '';

        const selects = [
            { el: selMarca,  id: 'filterMarca' },
            { el: selComb,   id: 'filterCombustible' },
            { el: selPrecio, id: 'filterPrecio' },
            { el: selAnio,   id: 'filterAnio' },
            { el: selKm,     id: 'filterKm' },
        ];

        selects.forEach(({ el, id }) => {
            if (!el || !el.value) return;
            const text = el.options[el.selectedIndex]?.text || el.value;
            const tag  = document.createElement('button');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `${text} <i data-lucide="x" size="12"></i>`;
            tag.dataset.filterId = id;
            tag.addEventListener('click', () => {
                el.value = '';
                filterCars();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
            activeFiltersContainer.appendChild(tag);
        });

        if (inputSearch && inputSearch.value.trim()) {
            const tag = document.createElement('button');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `"${inputSearch.value.trim()}" <i data-lucide="x" size="12"></i>`;
            tag.addEventListener('click', () => {
                inputSearch.value = '';
                filterCars();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
            activeFiltersContainer.appendChild(tag);
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* ── Reset de filtros ──────────────────────────────────────── */
    function resetFilters() {
        [selMarca, selComb, selPrecio, selAnio, selKm].forEach(el => {
            if (el) el.value = '';
        });
        if (inputSearch) inputSearch.value = '';
        const filterSearchMobEl = document.getElementById('filterSearchMob');
        if (filterSearchMobEl) filterSearchMobEl.value = '';
        filterCars();
        updateMobBadge();
    }

    /* ── Event listeners ───────────────────────────────────────── */
    [selMarca, selComb, selPrecio, selAnio, selKm].forEach(el => {
        if (el) el.addEventListener('change', () => { filterCars(); updateMobBadge(); });
    });
    if (inputSearch) inputSearch.addEventListener('input', filterCars);
    if (filterBtn)   filterBtn.addEventListener('click',  () => { filterCars(); closeMobSheet(); });
    if (resetBtn)    resetBtn.addEventListener('click',   resetFilters);

    /* ── Mobile filter sheet ───────────────────────────────────── */
    const filterBar           = document.getElementById('filterBar');
    const filterSheetOpen     = document.getElementById('filterSheetOpen');
    const filterSheetClose    = document.getElementById('filterSheetClose');
    const filterSheetBackdrop = document.getElementById('filterSheetBackdrop');
    const filterSearchMob     = document.getElementById('filterSearchMob');
    const filterMobBadge      = document.getElementById('filterMobBadge');
    const waFloat             = document.querySelector('.whatsapp-float');

    function openMobSheet() {
        filterBar?.classList.add('sheet-open');
        filterSheetBackdrop?.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (waFloat) waFloat.style.display = 'none';
    }

    function closeMobSheet() {
        filterBar?.classList.remove('sheet-open');
        filterSheetBackdrop?.classList.remove('active');
        document.body.style.overflow = '';
        if (waFloat) waFloat.style.display = '';
    }

    function updateMobBadge() {
        const n = [selMarca, selComb, selPrecio, selAnio, selKm].filter(el => el?.value).length;
        if (!filterMobBadge) return;
        if (n > 0) {
            filterMobBadge.textContent = n;
            filterMobBadge.classList.add('visible');
            filterSheetOpen?.classList.add('has-filters');
        } else {
            filterMobBadge.classList.remove('visible');
            filterSheetOpen?.classList.remove('has-filters');
        }
    }

    if (filterSheetOpen)     filterSheetOpen.addEventListener('click', openMobSheet);
    if (filterSheetClose)    filterSheetClose.addEventListener('click', closeMobSheet);
    if (filterSheetBackdrop) filterSheetBackdrop.addEventListener('click', closeMobSheet);

    if (filterSearchMob) {
        filterSearchMob.addEventListener('input', () => {
            if (inputSearch) inputSearch.value = filterSearchMob.value;
            filterCars();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeLightbox(); closeMobSheet(); }
    });

    /* ════════════════════════════════════════════════════════════
       LIGHTBOX
       ════════════════════════════════════════════════════════════ */
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    window.openLightbox = function (src, alt) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.closeLightbox = function () {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    /* ════════════════════════════════════════════════════════════
       BFCACHE: resetear estado al volver con botón atrás/adelante
       ════════════════════════════════════════════════════════════ */
    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) return;
        document.body.style.overflow = '';
        closeMobSheet();
        window.closeLightbox();
    });
       ════════════════════════════════════════════════════════════ */
    const GROQ_STOCK = `
        *[_type == "vehiculo" && disponible != false] | order(_createdAt desc) {
            "id":        slug.current,
            title,
            subtitle,
            marca,
            combustible,
            "año":       anio,
            km,
            precio,
            cv,
            ivaDed,
            "mainImage": images[0] { "src": asset->url, "hotspot": hotspot }
        }`;

    showLoading();

    sanityFetch(GROQ_STOCK)
        .then(data => {
            if (!data) {
                stockGrid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted)">
                        <i data-lucide="settings" size="48" style="opacity:.3;margin-bottom:1rem;display:inline-block"></i>
                        <h3 style="color:white;margin-bottom:.5rem">Sanity no está configurado</h3>
                        <p>Edita <code>scripts/sanity-config.js</code> y reemplaza <code>TU_PROJECT_ID</code>.</p>
                    </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }
            if (data.length === 0) {
                stockGrid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted)">
                        <p>No hay vehículos disponibles en este momento.</p>
                    </div>`;
                if (countEl) countEl.textContent = '0';
                return;
            }
            renderCards(data);
        })
        .catch(err => {
            console.error('[JoCar] Error cargando vehículos desde Sanity:', err);
            stockGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted)">
                    <p>Error al cargar el stock. Por favor, recarga la página.</p>
                </div>`;
        });

    if (countEl) countEl.textContent = '…';

}());
