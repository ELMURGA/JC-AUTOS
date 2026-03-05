/* JoCar Automóviles — Stock Filter + Lightbox */
(function () {
    'use strict';

    /* ─── Recopilar tarjetas ──────────────────────────────────── */
    const cards = Array.from(document.querySelectorAll('.car-card')).map(el => ({
        element:     el,
        marca:       el.dataset.marca      || '',
        combustible: el.dataset.combustible || '',
        año:         parseInt(el.dataset.año)   || 0,
        km:          parseInt(el.dataset.km)    || 0,
        precio:      parseInt(el.dataset.precio) || 0,
        title:       (el.querySelector('.car-title')?.textContent || '').toLowerCase()
    }));

    /* ─── Selectores de filtros ───────────────────────────────── */
    const selMarca  = document.getElementById('filterMarca');
    const selComb   = document.getElementById('filterCombustible');
    const selPrecio = document.getElementById('filterPrecio');
    const selAnio   = document.getElementById('filterAnio');
    const selKm     = document.getElementById('filterKm');
    const inputSearch = document.getElementById('filterSearch');

    const filterBtn    = document.getElementById('filterBtn');
    const resetBtn     = document.getElementById('resetFilters');
    const countEl      = document.getElementById('resultsCount');
    const noResults    = document.getElementById('noResults');
    const activeFiltersContainer = document.getElementById('activeFilters');

    /* ─── Etiquetas descriptivas para los filtros activos ────── */
    const LABELS = {
        filterMarca:       'Marca',
        filterCombustible: 'Combustible',
        filterPrecio:      'Precio máx.',
        filterAnio:        'Año desde',
        filterKm:          'Km máx.'
    };

    /* ─── Función principal de filtrado ──────────────────────── */
    function filterCars() {
        const marca    = selMarca.value;
        const comb     = selComb.value;
        const maxPrecio = selPrecio.value  ? parseInt(selPrecio.value)  : Infinity;
        const minAnio   = selAnio.value    ? parseInt(selAnio.value)    : 0;
        const maxKm     = selKm.value      ? parseInt(selKm.value)      : Infinity;
        const keyword   = inputSearch.value.trim().toLowerCase();

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
        if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';

        renderActiveTags();
    }

    /* ─── Renderiza etiquetas de filtros activos ──────────────── */
    function renderActiveTags() {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.innerHTML = '';

        const selects = [
            { el: selMarca,  id: 'filterMarca' },
            { el: selComb,   id: 'filterCombustible' },
            { el: selPrecio, id: 'filterPrecio' },
            { el: selAnio,   id: 'filterAnio' },
            { el: selKm,     id: 'filterKm' }
        ];

        selects.forEach(({ el, id }) => {
            if (!el || !el.value) return;
            const text = el.options[el.selectedIndex]?.text || el.value;
            const tag = document.createElement('button');
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

        // Keyword tag
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

    /* ─── Reset completo ─────────────────────────────────────── */
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

    /* ─── Event listeners ────────────────────────────────────── */
    [selMarca, selComb, selPrecio, selAnio, selKm].forEach(el => {
        if (el) el.addEventListener('change', () => { filterCars(); updateMobBadge(); });
    });

    if (inputSearch) inputSearch.addEventListener('input', filterCars);
    if (filterBtn)   filterBtn.addEventListener('click', () => { filterCars(); closeMobSheet(); });
    if (resetBtn)    resetBtn.addEventListener('click', resetFilters);

    /* ─── Mobile filter sheet ─────────────────────────────── */
    const filterBar          = document.getElementById('filterBar');
    const filterSheetOpen    = document.getElementById('filterSheetOpen');
    const filterSheetClose   = document.getElementById('filterSheetClose');
    const filterSheetBackdrop = document.getElementById('filterSheetBackdrop');
    const filterSearchMob    = document.getElementById('filterSearchMob');
    const filterMobBadge     = document.getElementById('filterMobBadge');
    const filterMobBtn       = document.getElementById('filterSheetOpen');

    const waFloat = document.querySelector('.whatsapp-float');

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
            filterMobBtn?.classList.add('has-filters');
        } else {
            filterMobBadge.classList.remove('visible');
            filterMobBtn?.classList.remove('has-filters');
        }
    }

    if (filterSheetOpen)    filterSheetOpen.addEventListener('click', openMobSheet);
    if (filterSheetClose)   filterSheetClose.addEventListener('click', closeMobSheet);
    if (filterSheetBackdrop) filterSheetBackdrop.addEventListener('click', closeMobSheet);

    // Mobile search → syncs with main search (which stays in DOM for JS filtering)
    if (filterSearchMob) {
        filterSearchMob.addEventListener('input', () => {
            if (inputSearch) inputSearch.value = filterSearchMob.value;
            filterCars();
        });
    }

    /* Tecla Escape cierra lightbox y sheet */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeMobSheet();
        }
    });

    /* Inicializar contador */
    filterCars();


    /* ══════════════════════════════════════════════════════════
       LIGHTBOX
       ══════════════════════════════════════════════════════════ */
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    // Abrir lightbox al hacer clic en una imagen de coche
    document.querySelectorAll('.car-image-wrapper img').forEach(img => {
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

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

    /* ══════════════════════════════════════════════════════════
       NAVEGACIÓN AL DETALLE DEL VEHÍCULO
       Clic en la tarjeta (excepto botón WhatsApp) → vehiculo.html
       ══════════════════════════════════════════════════════════ */
    document.querySelectorAll('.car-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn-whatsapp')) return;
            const id = card.dataset.id;
            if (id) window.location.href = `vehiculo.html?id=${id}`;
        });
    });

}());
