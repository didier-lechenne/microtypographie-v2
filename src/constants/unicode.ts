// src/constants/unicode.ts

/**
 * Caractères Unicode pour la typographie
 * @see https://unicode.org/charts/
 */
export const UNICODE_CHARS = {
    // ========================
    // ESPACES SPÉCIAUX
    // ========================
    
    /** Espace fine insécable (U+202F) - Utilisée avant ; ! ? en français */
    NO_BREAK_THIN_SPACE: '\u202F',
    
    /** Espace insécable (U+00A0) - Utilisée avant : en français */
    NO_BREAK_SPACE: '\u00A0',
    
    /** Espace normale (pour référence) */
    NORMAL_SPACE: ' ',

    // ========================
    // PONCTUATION
    // ========================
    
    /** Points de suspension (U+2026) - Remplace ... */
    ELLIPSIS: '…',
    
    /** Tiret demi-cadratin (U+2013) - Pour les plages de nombres */
    NDASH: '–',
    
    /** Tiret cadratin (U+2014) - Pour les incises en français */
    MDASH: '—',

    // ========================
    // GUILLEMETS ET APOSTROPHES
    // ========================
    
    /** Guillemet ouvrant anglais (U+201C) */
    LDQUO: '"',
    
    /** Guillemet fermant anglais (U+201D) */
    RDQUO: '"',
    
    /** Apostrophe ouvrante (U+2018) - Rarement utilisée */
    LSQUO: '“',
    
    /** Apostrophe fermante/typographique (U+2019) - Remplace ' */
    RSQUO: '”',
    
    /** Guillemet français ouvrant (U+00AB) */
    LAQUO: '«',
    
    /** Guillemet français fermant (U+00BB) */
    RAQUO: '»',

    // ========================
    // SYMBOLES MATHÉMATIQUES
    // ========================
    
    /** Symbole multiplication (U+00D7) - Remplace x entre nombres */
    TIMES: '×',
    
    /** Symbole division (U+00F7) */
    DIVIDE: '÷',
    
    /** Symbole plus ou moins (U+00B1) */
    PLUS_MINUS: '±',

    // ========================
    // SYMBOLES DE MARQUE
    // ========================
    
    /** Symbole trademark (U+2122) - Remplace (tm) */
    TRADE: '™',
    
    /** Symbole registered (U+00AE) - Remplace (r) */
    REG: '®',
    
    /** Symbole copyright (U+00A9) - Remplace (c) */
    COPY: '©',

    // ========================
    // AUTRES SYMBOLES UTILES
    // ========================
    
    /** Degré (U+00B0) */
    DEGREE: '°',
    
    /** Prime (U+2032) - Minutes, pieds */
    PRIME: '′',
    
    /** Double prime (U+2033) - Secondes, pouces */
    DOUBLE_PRIME: '″',
    
    /** Section (U+00A7) */
    SECTION: '§',
    
    /** Paragraphe (U+00B6) */
    PARAGRAPH: '¶',
    
} as const;

/**
 * Type des clés de caractères Unicode
 */
export type UnicodeCharKey = keyof typeof UNICODE_CHARS;

/**
 * Raccourcis pour les caractères les plus utilisés
 */
export const QUICK_CHARS = {
    /** Espace fine insécable - usage principal en français */
    NBSP_THIN: UNICODE_CHARS.NO_BREAK_THIN_SPACE,
    
    /** Espace insécable - usage avant les deux-points */
    NBSP: UNICODE_CHARS.NO_BREAK_SPACE,
    
    /** Ellipse typographique */
    ELLIPSIS: UNICODE_CHARS.ELLIPSIS,
    
    /** Tiret long français */
    DASH_FR: UNICODE_CHARS.MDASH,
    
    /** Tiret court pour les plages */
    DASH_EN: UNICODE_CHARS.NDASH,
    
    /** Apostrophe typographique */
    APOSTROPHE: UNICODE_CHARS.RSQUO,
    
} as const;

/**
 * Patterns regex utiles pour la détection
 */
export const UNICODE_PATTERNS = {
    /** Détecte les espaces multiples */
    MULTIPLE_SPACES: /\s{2,}/g,
    
    /** Détecte les points de suspension standards */
    ELLIPSIS_DOTS: /\.{3,}/g,
    
    /** Détecte les doubles tirets */
    DOUBLE_DASH: /--/g,
    
    /** Détecte les guillemets droits */
    STRAIGHT_QUOTES: /"/g,
    
    /** Détecte les apostrophes droites dans les contractions */
    STRAIGHT_APOSTROPHES: /(\w)'/g,
    
} as const;