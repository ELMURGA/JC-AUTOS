/**
 * JoCar Automóviles — Configuración Sanity CMS (Frontend)
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * ─────────────────────────────────────────────────────────────
 * 1. Ve a https://sanity.io y crea una cuenta gratuita.
 * 2. Crea un nuevo proyecto (o usa uno existente).
 * 3. Copia tu Project ID desde: sanity.io/manage → tu proyecto → Settings
 * 4. Sustituye 'TU_PROJECT_ID' por tu Project ID real.
 * 5. Configura los orígenes CORS en:
 *    sanity.io/manage → tu proyecto → API → CORS Origins
 *    Añade: http://localhost  |  http://127.0.0.1  |  https://tudominio.com
 * ─────────────────────────────────────────────────────────────
 */

const SANITY_CONFIG = {
    projectId:  'jirw2y07',        // JoCar Automóviles
    dataset:    'production',
    apiVersion: '2024-01-01',
    useCdn:     true,              // CDN de caché (más rápido para lecturas)
};

/**
 * Ejecuta una consulta GROQ contra la API de Sanity.
 * @param {string} query   Consulta GROQ
 * @param {Object} params  Parámetros tipados opcionales
 * @returns {Promise<any>}
 */
async function sanityFetch(query, params = {}) {
    const { projectId, dataset, apiVersion, useCdn } = SANITY_CONFIG;

    if (projectId === 'TU_PROJECT_ID') {
        console.warn(
            '[Sanity] Project ID no configurado. ' +
            'Edita scripts/sanity-config.js y reemplaza TU_PROJECT_ID.'
        );
        return null;
    }

    const host = useCdn
        ? `https://${projectId}.apicdn.sanity.io`
        : `https://${projectId}.api.sanity.io`;

    const url = new URL(`${host}/v${apiVersion}/data/query/${dataset}`);
    url.searchParams.set('query', query);

    // Parámetros tipados para GROQ (sintaxis: $nombre)
    Object.entries(params).forEach(([key, val]) => {
        url.searchParams.set(`$${key}`, JSON.stringify(val));
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`Sanity API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
}

/**
 * Construye una URL optimizada de imagen Sanity (añade parámetros CDN).
 * - Convierte automáticamente JPG/PNG → WebP (auto=format)
 * - Soporta recorte por punto focal (hotspot) para imágenes bien encuadradas
 *
 * @param {string}  rawUrl   URL base del asset de Sanity
 * @param {Object}  opts     w, h, fit, q, hotspot ({ x, y } en rango 0-1)
 * @returns {string|null}
 */
function sanityImg(rawUrl, opts = {}) {
    if (!rawUrl) return null;
    try {
        const url = new URL(rawUrl);
        const { w, h, fit = 'max', q = 80, auto = 'format', hotspot } = opts;
        if (w) url.searchParams.set('w', w);
        if (h) url.searchParams.set('h', h);
        url.searchParams.set('fit', fit);
        url.searchParams.set('q', q);
        url.searchParams.set('auto', auto);
        // Focal point: recorta centrando en el punto marcado en el studio
        if (hotspot && fit === 'crop') {
            url.searchParams.set('fp-x', hotspot.x.toFixed(4));
            url.searchParams.set('fp-y', hotspot.y.toFixed(4));
            url.searchParams.set('crop', 'focalpoint');
        }
        return url.toString();
    } catch {
        return rawUrl;
    }
}
