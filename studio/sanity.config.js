import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes/index'

export default defineConfig({
    name: 'jocar-studio',
    title: 'JoCar Automóviles — CMS',

    // ── IMPORTANTE ──────────────────────────────────────────────
    // Reemplaza 'TU_PROJECT_ID' con el ID de tu proyecto Sanity.
    // Lo obtienes en: https://sanity.io/manage → tu proyecto → Settings
    // ────────────────────────────────────────────────────────────
    projectId: 'jirw2y07',
    dataset: 'production',

    plugins: [structureTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})
