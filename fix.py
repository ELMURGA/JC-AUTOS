import re

with open('/Users/usuario/Downloads/jocar/styles/index.css', 'r') as f:
    css = f.read()

# I need to restore the deleted block. Looking at the diff, it was deleted between `.car-placeholder i {` and `.service-card:hover { box-shadow... }`

missing_css = """    opacity: 0.4;
}

.car-tags {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    display: flex;
    gap: 0.5rem;
    z-index: 2;
}

.car-content {
    padding: var(--space-3);
}

.car-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.car-price {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--accent-primary);
    margin-bottom: 0.25rem;
}

.car-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-2);
}

.car-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--border-color);
}

.spec-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

/* Services */
.bg-surface {
    background-color: var(--bg-surface);
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
}

.service-card {
    background-color: var(--bg-surface-elevated);
    padding: var(--space-4);
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    transition: all var(--transition-normal);
}

.service-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-5px);"""

# The bad replace resulted in:
bad_css = """.car-placeholder i {
/* --- Stock Page --- */"""

# Actually, the diff shows it inserted the `/* --- Stock Page --- */` block inside `.car-placeholder i {` !

# Let's read the current file and find the exact bad part.
