export default {
    name: 'vehiculo',
    title: 'Vehículo',
    type: 'document',

    fields: [
        // ── Identificación ────────────────────────────────────
        {
            name: 'slug',
            title: 'Slug (ID en la URL)',
            type: 'slug',
            description: 'Se genera automáticamente. Ej: vw-touareg-rline',
            options: {
                source: 'title',
                maxLength: 96,
                slugify: str =>
                    str
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
            },
            validation: Rule => Rule.required(),
        },
        {
            name: 'disponible',
            title: 'Disponible (visible en el stock)',
            type: 'boolean',
            initialValue: true,
            description: 'Desactiva para ocultar el vehículo sin borrarlo',
        },

        // ── Datos principales ──────────────────────────────────
        {
            name: 'title',
            title: 'Título del vehículo',
            type: 'string',
            description: 'Ej: Volkswagen Touareg R-Line',
            validation: Rule => Rule.required(),
        },
        {
            name: 'subtitle',
            title: 'Subtítulo',
            type: 'string',
            description: 'Ej: 3.0 TDI V6 286CV 4MOTION 8-velocidades',
        },
        {
            name: 'marca',
            title: 'Marca',
            type: 'string',
            options: {
                list: [
                    { title: 'Audi',          value: 'audi' },
                    { title: 'BMW',           value: 'bmw' },
                    { title: 'Citroën',       value: 'citroen' },
                    { title: 'Cupra',         value: 'cupra' },
                    { title: 'Fiat',          value: 'fiat' },
                    { title: 'Ford',          value: 'ford' },
                    { title: 'Hyundai',       value: 'hyundai' },
                    { title: 'KIA',           value: 'kia' },
                    { title: 'Land Rover',    value: 'landrover' },
                    { title: 'Mercedes-Benz', value: 'mercedes' },
                    { title: 'Mini',          value: 'mini' },
                    { title: 'Mitsubishi',    value: 'mitsubishi' },
                    { title: 'Nissan',        value: 'nissan' },
                    { title: 'Opel',          value: 'opel' },
                    { title: 'Peugeot',       value: 'peugeot' },
                    { title: 'Porsche',       value: 'porsche' },
                    { title: 'Renault',       value: 'renault' },
                    { title: 'Seat',          value: 'seat' },
                    { title: 'Škoda',         value: 'skoda' },
                    { title: 'Toyota',        value: 'toyota' },
                    { title: 'Volkswagen',    value: 'volkswagen' },
                    { title: 'Volvo',         value: 'volvo' },
                ],
            },
            validation: Rule => Rule.required(),
        },
        {
            name: 'modelo',
            title: 'Modelo del vehículo',
            type: 'string',
            description: 'Nombre del modelo. Ej: Touareg, Q7, X3, 3008, Tiguan...',
            validation: Rule => Rule.required(),
        },
        {
            name: 'combustible',
            title: 'Combustible',
            type: 'string',
            options: {
                list: [
                    { title: 'Diésel',    value: 'diesel' },
                    { title: 'Gasolina',  value: 'gasolina' },
                    { title: 'Híbrido',   value: 'hibrido' },
                    { title: 'Eléctrico', value: 'electrico' },
                ],
            },
            validation: Rule => Rule.required(),
        },

        // ── Datos numéricos ────────────────────────────────────
        {
            name: 'anio',
            title: 'Año',
            type: 'number',
            validation: Rule => Rule.required().integer().min(1990).max(2030),
        },
        {
            name: 'km',
            title: 'Kilómetros',
            type: 'number',
            validation: Rule => Rule.required().min(0),
        },
        {
            name: 'precio',
            title: 'Precio (€)',
            type: 'number',
            validation: Rule => Rule.required().min(0),
        },
        {
            name: 'cv',
            title: 'Potencia (CV)',
            type: 'number',
        },
        {
            name: 'cilindrada',
            title: 'Cilindrada',
            type: 'string',
            description: 'Ej: 3.0, 2.0, 1.5',
        },

        // ── Mecánica ───────────────────────────────────────────
        {
            name: 'cambio',
            title: 'Cambio',
            type: 'string',
            options: {
                list: [
                    { title: 'Automático', value: 'Automático' },
                    { title: 'Manual',     value: 'Manual' },
                ],
            },
        },
        {
            name: 'traccion',
            title: 'Tracción',
            type: 'string',
            description: 'Ej: 4MOTION (4x4), Quattro (4x4), Delantera...',
        },
        {
            name: 'puertas',
            title: 'Puertas',
            type: 'number',
        },
        {
            name: 'plazas',
            title: 'Plazas',
            type: 'number',
        },
        {
            name: 'color',
            title: 'Color',
            type: 'string',
        },
        {
            name: 'ivaDed',
            title: 'IVA deducible',
            type: 'boolean',
            description: 'Activa si el IVA es deducible para empresas y autónomos',
            initialValue: false,
        },

        // ── Fotos (múltiples) ──────────────────────────────────
        {
            name: 'images',
            title: 'Fotos del vehículo',
            description: 'Sube todas las fotos. La primera será la imagen principal en el stock.',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            title: 'Descripción de la foto',
                            type: 'string',
                            description: 'Ej: BMW X3 exterior frontal',
                        },
                    ],
                },
            ],
        },

        // ── Descripción ────────────────────────────────────────
        {
            name: 'description',
            title: 'Descripción del vehículo',
            type: 'text',
            rows: 5,
        },

        // ── Ficha técnica (tabla clave-valor) ──────────────────
        {
            name: 'specs',
            title: 'Ficha técnica',
            description: 'Añade las especificaciones técnicas (pares campo/valor)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'specItem',
                    title: 'Especificación',
                    fields: [
                        { name: 'key',   title: 'Campo', type: 'string' },
                        { name: 'value', title: 'Valor', type: 'string' },
                    ],
                    preview: {
                        select: { title: 'key', subtitle: 'value' },
                    },
                },
            ],
        },

        // ── Equipamiento por categorías ────────────────────────
        {
            name: 'equipment',
            title: 'Equipamiento de serie',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'equipmentCategory',
                    title: 'Categoría de equipamiento',
                    fields: [
                        {
                            name: 'category',
                            title: 'Nombre de la categoría',
                            type: 'string',
                            description: 'Ej: Confort & Tecnología, Seguridad, Exterior...',
                        },
                        {
                            name: 'items',
                            title: 'Elementos',
                            type: 'array',
                            of: [{ type: 'string' }],
                        },
                    ],
                    preview: {
                        select: { title: 'category' },
                    },
                },
            ],
        },
    ],

    // Vista previa en el panel de Sanity Studio
    preview: {
        select: {
            title:    'title',
            subtitle: 'subtitle',
            media:    'images.0',
        },
    },
}
