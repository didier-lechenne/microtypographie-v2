// src/settings/default-settings.ts
import { TypographySettings } from '../types/interfaces';

/**
 * Configuration par défaut du plugin - basée sur JoliTypo fr_FR
 */
export const DEFAULT_SETTINGS: TypographySettings = {
    enableRealTimeCorrection: true,
    locale: 'fr_FR',
    highlightEnabled: false,
    highlightButton: true,     
    tabTitleBarButton: false, 
    guillemetsEnabled: true,
    colonSpaceType: 'thin', // Espace fine insécable par défaut (comportement standard français)
    fixers: {
        'Ellipsis': true,
        'Dash': true,
        'SmartQuotes': true,
        'CurlyQuote': true,
        'FrenchNoBreakSpace': true,
        'NoSpaceBeforeComma': true,
        'Unit': true,
        'Dimension': true,
        'Hyphen': false,
        'Trademark': true
    }
};

/**
 * Configurations JoliTypo par locale
 */
export const LOCALE_CONFIGURATIONS: Record<string, string[]> = {
    'en_GB': [
        'Ellipsis', 
        'Dimension', 
        'Unit', 
        'Dash', 
        'SmartQuotes', 
        'NoSpaceBeforeComma', 
        'CurlyQuote', 
        'Hyphen', 
        'Trademark'
    ],
    'fr_FR': [
        'Ellipsis', 
        'Dimension', 
        'Unit', 
        'Dash', 
        'SmartQuotes', 
        'FrenchNoBreakSpace', 
        'NoSpaceBeforeComma', 
        'CurlyQuote', 
        'Hyphen', 
        'Trademark'
    ],
    'fr_CA': [
        'Ellipsis', 
        'Dimension', 
        'Unit', 
        'Dash', 
        'SmartQuotes', 
        'NoSpaceBeforeComma', 
        'CurlyQuote', 
        'Hyphen', 
        'Trademark'
    ],
    'de_DE': [
        'Ellipsis', 
        'Dimension', 
        'Unit', 
        'Dash', 
        'SmartQuotes', 
        'NoSpaceBeforeComma', 
        'CurlyQuote', 
        'Hyphen', 
        'Trademark'
    ]
};

/**
 * Noms d'affichage des langues
 */
export const LOCALE_NAMES: Record<string, string> = {
    'fr_FR': '🇫🇷 Français (France)',
    'fr_CA': '🇨🇦 Français (Canada)',
    'en_GB': '🇬🇧 English (UK)',
    'de_DE': '🇩🇪 Deutsch (Deutschland)'
};

/**
 * Factory pour créer des paramètres selon la langue
 */
export function createSettingsForLocale(locale: string): TypographySettings {
    const activeFixers = LOCALE_CONFIGURATIONS[locale] || LOCALE_CONFIGURATIONS['fr_FR'];
    
    const settings: TypographySettings = {
        enableRealTimeCorrection: true,
        locale: locale,
        highlightEnabled: false,
        highlightButton: true,        
        tabTitleBarButton: false,  
        guillemetsEnabled: true,
        colonSpaceType: 'thin', // Toujours par défaut
        fixers: {}
    };

    // Initialiser tous les fixers à false
    Object.keys(DEFAULT_SETTINGS.fixers).forEach(fixerId => {
        settings.fixers[fixerId] = false;
    });

    // Activer les fixers recommandés pour cette locale
    activeFixers.forEach(fixerId => {
        settings.fixers[fixerId] = true;
    });

    return settings;
}

/**
 * Valide et corrige les paramètres chargés
 */
export function validateSettings(settings: Partial<TypographySettings>): TypographySettings {
    const validated: TypographySettings = {
        enableRealTimeCorrection: settings.enableRealTimeCorrection ?? DEFAULT_SETTINGS.enableRealTimeCorrection,
        locale: settings.locale ?? DEFAULT_SETTINGS.locale,
        highlightEnabled: settings.highlightEnabled ?? DEFAULT_SETTINGS.highlightEnabled,
        highlightButton: settings.highlightButton ?? DEFAULT_SETTINGS.highlightButton,
        tabTitleBarButton: settings.tabTitleBarButton ?? DEFAULT_SETTINGS.tabTitleBarButton,
        guillemetsEnabled: settings.guillemetsEnabled ?? DEFAULT_SETTINGS.guillemetsEnabled,
        colonSpaceType: settings.colonSpaceType ?? DEFAULT_SETTINGS.colonSpaceType, // Validation du nouveau paramètre
        fixers: { ...DEFAULT_SETTINGS.fixers, ...settings.fixers }
    };

    // Assurer que tous les fixers ont une valeur booléenne
    Object.keys(DEFAULT_SETTINGS.fixers).forEach(fixerId => {
        if (typeof validated.fixers[fixerId] !== 'boolean') {
            validated.fixers[fixerId] = DEFAULT_SETTINGS.fixers[fixerId];
        }
    });

    // Vérifier que la locale est supportée
    if (!(validated.locale in LOCALE_CONFIGURATIONS)) {
        validated.locale = 'fr_FR';
    }

    // Valider colonSpaceType
    if (validated.colonSpaceType !== 'thin' && validated.colonSpaceType !== 'normal') {
        validated.colonSpaceType = 'thin';
    }

    return validated;
}

/**
 * Obtient la liste des fixers recommandés pour une locale
 */
export function getRecommendedFixersForLocale(locale: string): string[] {
    return LOCALE_CONFIGURATIONS[locale] || LOCALE_CONFIGURATIONS['fr_FR'];
}

/**
 * Vérifie si un fixer est recommandé pour une locale donnée
 */
export function isFixerRecommendedForLocale(fixerId: string, locale: string): boolean {
    const recommendedFixers = getRecommendedFixersForLocale(locale);
    return recommendedFixers.includes(fixerId);
}

/**
 * Métadonnées sur les catégories de fixers
 */
export const FIXER_CATEGORIES: Record<string, string[]> = {
    'punctuation': ['Ellipsis', 'Dash', 'Hyphen'],
    'spacing': ['FrenchNoBreakSpace', 'NoSpaceBeforeComma', 'Unit', 'Dimension'],
    'quotes': ['SmartQuotes', 'CurlyQuote'],
    'symbols': ['Trademark']
};

/**
 * Noms d'affichage des catégories
 */
export const CATEGORY_NAMES: Record<string, string> = {
    'punctuation': 'Ponctuation',
    'spacing': 'Espacement', 
    'quotes': 'Guillemets',
    'symbols': 'Symboles'
};