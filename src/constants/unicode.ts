// src/constants/unicode.ts

/**
 * Caractères Unicode pour la typographie
 * @see https://unicode.org/charts/
 */
export const UNICODE_CHARS = {
  // ========================
  // ESPACES SPÉCIAUX
  // ========================

  NO_BREAK_THIN_SPACE: "\u202F" /** Espace fine insécable (U+202F) - Utilisée avant ; ! ? en français */,
  NO_BREAK_SPACE: "\u00A0" /** Espace insécable (U+00A0) - Utilisée avant : en français */,
  NORMAL_SPACE: " " /** Espace normale (pour référence) */,

  // ========================
  // PONCTUATION
  // ========================

  ELLIPSIS: "…" /** Points de suspension (U+2026) - Remplace ... */,
  NDASH: "–" /** Tiret demi-cadratin (U+2013) - Pour les plages de nombres */,
  MDASH: "—" /** Tiret cadratin (U+2014) - Pour les incises en français */,

  // ========================
  // GUILLEMETS ET APOSTROPHES
  // ========================

  LDQUO: "“" /** Guillemet ouvrant anglais (U+201C) */,
  RDQUO: "”" /** Guillemet fermant anglais (U+201D) */,

  /** LSQUO: '“',  Apostrophe ouvrante (U+2018) - Rarement utilisée */

  RSQUO: "’" /** Apostrophe fermante/typographique (U+2019) - Remplace ' */,
  LAQUO: "«" /** Guillemet français ouvrant (U+00AB) */,
  RAQUO: "»" /** Guillemet français fermant (U+00BB) */,

  BDQUO: "„", // &bdquo; or &#8222;
  SHY: "\xC2\xAD", // &shy;

  // ========================
  // SYMBOLES MATHÉMATIQUES
  // ========================

  TIMES: "×" /** Symbole multiplication (U+00D7) - Remplace x entre nombres */,
  DIVIDE: "÷" /** Symbole division (U+00F7) */,
  PLUS_MINUS: "±", /** Symbole plus ou moins (U+00B1) */ 
  MINUS: "−", /** Symbole moins (U+2212) - Plus long que le trait d'union standard */

  // ========================
  // SYMBOLES DE MARQUE
  // ========================

  /** Symbole trademark (U+2122) - Remplace (tm) */
  TRADE: "™",
  REG: "®", /** Symbole registered (U+00AE) - Remplace (r) */
  COPY: "©", /** Symbole copyright (U+00A9) - Remplace (c) */


  // ========================
  // AUTRES SYMBOLES UTILES
  // ========================

  
  PRIME: "′", /** Prime (U+2032) - Minutes, pieds */
  DOUBLE_PRIME: "″",   /** Double prime (U+2033) - Secondes, pouces */
  SECTION: "§",   /** Section (U+00A7) */
  PARAGRAPH: "¶",   /** Paragraphe (U+00B6) */
  BULLET: "•",   /** Puce (U+2022) */
  ARROW_RIGHT: "→",   /** Flèche droite (U+2192) */
  ARROW_LEFT: "←",   /** Flèche gauche (U+2190) */
  EURO: "€", /** Euro (U+20AC) */ 
  POUND: "£", /** Livre sterling (U+00A3) */ 
  YEN: "¥", /** Yen (U+00A5) */
} as const;

/**
 * Type des clés de caractères Unicode
 */
export type UnicodeCharKey = keyof typeof UNICODE_CHARS;

/**
 * Patterns regex utiles pour la détection
 */
export const UNICODE_PATTERNS = {
  
  MULTIPLE_SPACES: /\s{2,}/g, /** Détecte les espaces multiples */  
  ELLIPSIS_DOTS: /\.{3,}/g, /** Détecte les points de suspension standards */  
  DOUBLE_DASH: /--/g, /** Détecte les doubles tirets */ 
  STRAIGHT_QUOTES: /"/g,  /** Détecte les guillemets droits */ 
  STRAIGHT_APOSTROPHES: /(\w)'/g,  /** Détecte les apostrophes droites dans les contractions */  
  MULTIPLY_X: /(\d+)\s*[xX]\s*(\d+)/g, /** Détecte x entre nombres pour multiplication */  
  MULTIPLY_STAR: /(\d+)\s*\*\s*(\d+)/g, /** Détecte * entre nombres pour multiplication */

  /** Détecte les symboles de marque textuels */
  TRADEMARK_TEXT: /\(tm\)/gi,
  REGISTERED_TEXT: /\(r\)/gi,
  COPYRIGHT_TEXT: /\(c\)/gi,
} as const;
