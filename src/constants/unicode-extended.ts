// src/constants/unicode-extended.ts

/**
 * Caractères Unicode étendus pour la typographie
 * Inspiré de JoliTypo pour une compatibilité maximale
 * @see https://github.com/jolicode/JoliTypo
 */
export const UNICODE_CHARS_EXTENDED = {
    // ========================
    // ESPACES SPÉCIAUX (repris + améliorés)
    // ========================
    
    /** Espace fine insécable (U+202F) - Utilisée avant ; ! ? en français */
    NO_BREAK_THIN_SPACE: '\u202F',
    
    /** Espace insécable (U+00A0) - Utilisée avant : en français */
    NO_BREAK_SPACE: '\u00A0',
    
    /** Espace normale (pour référence) */
    NORMAL_SPACE: ' ',
    
    /** Césure douce (U+00AD) - Soft hyphen pour la césure automatique */
    SHY: '\u00AD',

    // ========================
    // PONCTUATION (repris + améliorés)
    // ========================
    
    /** Points de suspension (U+2026) - Remplace ... */
    ELLIPSIS: '…',
    
    /** Tiret demi-cadratin (U+2013) - Pour les plages de nombres */
    NDASH: '–',
    
    /** Tiret cadratin (U+2014) - Pour les incises en français */
    MDASH: '—',

    // ========================
    // GUILLEMETS ET APOSTROPHES (complets)
    // ========================
    
    /** Guillemet ouvrant anglais (U+201C) */
    LDQUO: '“',
    
    /** Guillemet fermant anglais (U+201D) */
    RDQUO: '”',
    
    /** Apostrophe ouvrante (U+2018) - Guillemet simple ouvrant */
    LSQUO: '‘',
    
    /** Apostrophe fermante/typographique (U+2019) - Remplace ' */
    RSQUO: '’',
    
    /** Guillemet français ouvrant (U+00AB) */
    LAQUO: '«',
    
    /** Guillemet français fermant (U+00BB) */
    RAQUO: '»',
    
    /** Guillemet allemand bas ouvrant (U+201E) - „ */
    BDQUO: '„',

    // ========================
    // SYMBOLES MATHÉMATIQUES (étendus)
    // ========================
    
    /** Symbole multiplication (U+00D7) - Remplace x entre nombres */
    TIMES: '×',
    
    /** Symbole division (U+00F7) */
    DIVIDE: '÷',
    
    /** Symbole plus ou moins (U+00B1) */
    PLUS_MINUS: '±',
    
    /** Symbole moins (U+2212) - Différent du trait d'union */
    MINUS: '−',
    
    /** Symbole approximativement égal (U+2248) */
    ALMOST_EQUAL: '≈',
    
    /** Symbole infini (U+221E) */
    INFINITY: '∞',

    // ========================
    // SYMBOLES DE MARQUE (complets)
    // ========================
    
    /** Symbole trademark (U+2122) - Remplace (tm) */
    TRADE: '™',
    
    /** Symbole registered (U+00AE) - Remplace (r) */
    REG: '®',
    
    /** Symbole copyright (U+00A9) - Remplace (c) */
    COPY: '©',
    
    /** Symbole sound recording copyright (U+2117) */
    SOUND_COPY: '℗',

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
    
    /** Puce (U+2022) */
    BULLET: '•',
    
    /** Flèche droite (U+2192) */
    RIGHTWARD_ARROW: '→',
    
    /** Flèche gauche (U+2190) */
    LEFTWARD_ARROW: '←',

    // ========================
    // SYMBOLES MONÉTAIRES
    // ========================
    
    /** Euro (U+20AC) */
    EURO: '€',
    
    /** Livre sterling (U+00A3) */
    POUND: '£',
    
    /** Yen (U+00A5) */
    YEN: '¥',
    
    /** Dollar (U+0024) */
    DOLLAR: '$',
    
    /** Centime (U+00A2) */
    CENT: '¢',

} as const;

/**
 * Pattern de tous les espaces supportés (pour regex)
 * Équivalent à ALL_SPACES de JoliTypo
 */
export const ALL_SPACES_PATTERN = `${UNICODE_CHARS_EXTENDED.NO_BREAK_THIN_SPACE}|${UNICODE_CHARS_EXTENDED.SHY}|${UNICODE_CHARS_EXTENDED.NO_BREAK_SPACE}|\\s`;

/**
 * Raccourcis pour une utilisation simplifiée
 */
export const QUICK_UNICODE = {
    /** Espace fine insécable - usage principal en français */
    NBSP_THIN: UNICODE_CHARS_EXTENDED.NO_BREAK_THIN_SPACE,
    
    /** Espace insécable - usage avant les deux-points */
    NBSP: UNICODE_CHARS_EXTENDED.NO_BREAK_SPACE,
    
    /** Ellipse typographique */
    ELLIPSIS: UNICODE_CHARS_EXTENDED.ELLIPSIS,
    
    /** Tiret long français */
    DASH_FR: UNICODE_CHARS_EXTENDED.MDASH,
    
    /** Tiret court pour les plages */
    DASH_EN: UNICODE_CHARS_EXTENDED.NDASH,
    
    /** Apostrophe typographique */
    APOSTROPHE: UNICODE_CHARS_EXTENDED.RSQUO,
    
    /** Multiplication */
    MULTIPLY: UNICODE_CHARS_EXTENDED.TIMES,
    
    /** Copyright */
    COPYRIGHT: UNICODE_CHARS_EXTENDED.COPY,
    
    /** Trademark */
    TRADEMARK: UNICODE_CHARS_EXTENDED.TRADE,
    
    /** Registered */
    REGISTERED: UNICODE_CHARS_EXTENDED.REG,
    
} as const;

/**
 * Patterns regex utiles pour la détection
 * Étendus par rapport à l'original
 */
export const UNICODE_PATTERNS_EXTENDED = {
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
    
    /** Détecte les symboles de marque approximatifs */
    TRADEMARK_APPROXIMATIONS: /\((tm|TM|r|R|c|C)\)/g,
    
    /** Détecte les dimensions avec x */
    DIMENSIONS_WITH_X: /(\d+)\s*[x×]\s*(\d+)/gi,
    
    /** Détecte nombres + unités (avec espaces à corriger) */
    NUMBER_UNIT: /(\d+(?:[,.]?\d+)?)\s*([a-zA-Z€$£¥%°]+)/g,
    
    /** Détecte tous les espaces supportés */
    ALL_SPACES: new RegExp(ALL_SPACES_PATTERN, 'g'),
    
} as const;

/**
 * Correspondances pour les conversions rapides
 */
export const UNICODE_REPLACEMENTS = {
    /** Conversions de symboles de marque */
    TRADEMARK_SYMBOLS: {
        '(tm)': UNICODE_CHARS_EXTENDED.TRADE,
        '(TM)': UNICODE_CHARS_EXTENDED.TRADE,
        '(r)': UNICODE_CHARS_EXTENDED.REG,
        '(R)': UNICODE_CHARS_EXTENDED.REG,
        '(c)': UNICODE_CHARS_EXTENDED.COPY,
        '(C)': UNICODE_CHARS_EXTENDED.COPY,
    },
    
    /** Conversions de guillemets selon la langue */
    QUOTES_BY_LOCALE: {
        'fr': {
            open: UNICODE_CHARS_EXTENDED.LAQUO + UNICODE_CHARS_EXTENDED.NO_BREAK_SPACE,
            close: UNICODE_CHARS_EXTENDED.NO_BREAK_SPACE + UNICODE_CHARS_EXTENDED.RAQUO,
        },
        'en': {
            open: UNICODE_CHARS_EXTENDED.LDQUO,
            close: UNICODE_CHARS_EXTENDED.RDQUO,
        },
        'de': {
            open: UNICODE_CHARS_EXTENDED.BDQUO,
            close: UNICODE_CHARS_EXTENDED.LDQUO,
        }
    }
} as const;

/**
 * Type pour les clés de caractères Unicode
 */
export type UnicodeCharKey = keyof typeof UNICODE_CHARS_EXTENDED;

/**
 * Utilitaire pour obtenir un caractère Unicode par sa clé
 */
export function getUnicodeChar(key: UnicodeCharKey): string {
    return UNICODE_CHARS_EXTENDED[key];
}

/**
 * Utilitaire pour vérifier si un texte contient des caractères Unicode spéciaux
 */
export function hasUnicodeChars(text: string): boolean {
    return Object.values(UNICODE_CHARS_EXTENDED).some(char => text.includes(char));
}