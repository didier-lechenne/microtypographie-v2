// src/constants/unicode.ts

/**
 * Caractères Unicode pour la typographie
 * @see https://unicode.org/charts/
 */
export const UNICODE_CHARS = {
    // ========================
    // ESPACES SPÉCIAUX
    // ========================
    
    NO_BREAK_THIN_SPACE: '\u202F', /** Espace fine insécable (U+202F) - Utilisée avant ; ! ? en français */
    NO_BREAK_SPACE: '\u00A0', /** Espace insécable (U+00A0) - Utilisée avant : en français */
    NORMAL_SPACE: ' ', /** Espace normale (pour référence) */

    // ========================
    // PONCTUATION
    // ========================
    
    ELLIPSIS: '…', /** Points de suspension (U+2026) - Remplace ... */
    NDASH: '–', /** Tiret demi-cadratin (U+2013) - Pour les plages de nombres */
    MDASH: '—', /** Tiret cadratin (U+2014) - Pour les incises en français */

    // ========================
    // GUILLEMETS ET APOSTROPHES
    // ========================

    LDQUO: '“',  /** Guillemet ouvrant anglais (U+201C) */
    RDQUO: '”',  /** Guillemet fermant anglais (U+201D) */
    
    LSQUO: '“', /** Apostrophe ouvrante (U+2018) - Rarement utilisée */

    RSQUO: '’', /** Apostrophe fermante/typographique (U+2019) - Remplace ' */
    LAQUO: '«', /** Guillemet français ouvrant (U+00AB) */
    RAQUO: '»', /** Guillemet français fermant (U+00BB) */

    BDQUO: '„', // &bdquo; or &#8222;
    SHY: "\xC2\xAD", // &shy;

    // ========================
    // SYMBOLES MATHÉMATIQUES
    // ========================
    
    /** Symbole multiplication (U+00D7) - Remplace x entre nombres */
    TIMES: '×',
    
    /** Symbole division (U+00F7) */
    DIVIDE: '÷',
    
    /** Symbole plus ou moins (U+00B1) */
    PLUS_MINUS: '±',
    
    /** Symbole moins (U+2212) - Plus long que le trait d'union standard */
    MINUS: '−',

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
    
    /** Prime (U+2032) - Minutes, pieds */
    PRIME: '′',
    
    /** Double prime (U+2033) - Secondes, pouces */
    DOUBLE_PRIME: '″',
    
    /** Section (U+00A7) */
    SECTION: '§',
    
    /** Paragraphe (U+00B6) */
    PARAGRAPH: '¶',
    
    /** Puce (U+2022) */
    BULLET: '•',
    
    /** Flèche droite (U+2192) */
    ARROW_RIGHT: '→',
    
    /** Flèche gauche (U+2190) */
    ARROW_LEFT: '←',
    
    /** Euro (U+20AC) */
    EURO: '€',
    
    /** Livre sterling (U+00A3) */
    POUND: '£',
    
    /** Yen (U+00A5) */
    YEN: '¥',
    
} as const;

/**
 * Type des clés de caractères Unicode
 */
export type UnicodeCharKey = keyof typeof UNICODE_CHARS;

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
    
    /** Détecte x entre nombres pour multiplication */
    MULTIPLY_X: /(\d+)\s*[xX]\s*(\d+)/g,
    
    /** Détecte * entre nombres pour multiplication */
    MULTIPLY_STAR: /(\d+)\s*\*\s*(\d+)/g,
    
    /** Détecte les symboles de marque textuels */
    TRADEMARK_TEXT: /\(tm\)/gi,
    REGISTERED_TEXT: /\(r\)/gi,
    COPYRIGHT_TEXT: /\(c\)/gi,
    
} as const;

