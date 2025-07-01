// src/settings/default-settings.ts
import { TypographySettings } from '../types/interfaces';

/**
 * Configuration par défaut du plugin - optimisée pour le français
 */
export const DEFAULT_SETTINGS: TypographySettings = {
    enableRealTimeCorrection: true,
    locale: 'fr-FR',
    fixers: {
        // Ponctuation - Priorité haute
        'ellipsis': true,        // Points de suspension : ... → …
        'dash': true,            // Tirets typographiques : -- → —
        
        // Espacement français - Essentiel pour le français
        'french-spacing': true,  // Espaces insécables : ! ? ; :
        'no-space-comma': true,  // Virgules sans espace avant
        
        // Guillemets - Adaptatifs selon la langue
        'smart-quotes': true,    // Guillemets français « » ou anglais " "
        
    },
    

};

/**
 * Configuration alternative pour l'anglais
 */
export const ENGLISH_SETTINGS: TypographySettings = {
    enableRealTimeCorrection: true,
    locale: 'en-US',
    fixers: {
        'ellipsis': true,
        'dash': true,
        'french-spacing': false,  // Désactivé pour l'anglais
        'no-space-comma': true,
        'smart-quotes': true,
    }
};

/**
 * Configuration minimaliste (uniquement l'essentiel)
 */
export const MINIMAL_SETTINGS: TypographySettings = {
    enableRealTimeCorrection: false,
    locale: 'fr-FR',
    fixers: {
        'ellipsis': true,
        'dash': false,
        'french-spacing': false,
        'no-space-comma': true,
        'smart-quotes': false,
    }
};

/**
 * Préconfigurations disponibles
 */
export const PRESET_CONFIGURATIONS = {
    french: DEFAULT_SETTINGS,
    english: ENGLISH_SETTINGS,
    minimal: MINIMAL_SETTINGS
} as const;

/**
 * Noms d'affichage des préconfigurations
 */
export const PRESET_NAMES = {
    french: 'Français (recommandé)',
    english: 'English',
    minimal: 'Minimal'
} as const;

/**
 * Factory pour créer des paramètres selon la langue
 */
export function createSettingsForLocale(locale: string): TypographySettings {
    if (locale.startsWith('fr')) {
        return { ...DEFAULT_SETTINGS, locale };
    } else if (locale.startsWith('en')) {
        return { ...ENGLISH_SETTINGS, locale };
    } else {
        // Par défaut, utiliser la configuration française
        return { ...DEFAULT_SETTINGS, locale };
    }
}

/**
 * Valide et corrige les paramètres chargés
 */
export function validateSettings(settings: Partial<TypographySettings>): TypographySettings {
    const validated: TypographySettings = {
        enableRealTimeCorrection: settings.enableRealTimeCorrection ?? DEFAULT_SETTINGS.enableRealTimeCorrection,
        locale: settings.locale ?? DEFAULT_SETTINGS.locale,
        fixers: { ...DEFAULT_SETTINGS.fixers, ...settings.fixers }
    };

    // Assurer que tous les fixers ont une valeur booléenne
    Object.keys(DEFAULT_SETTINGS.fixers).forEach(fixerId => {
        if (typeof validated.fixers[fixerId] !== 'boolean') {
            validated.fixers[fixerId] = DEFAULT_SETTINGS.fixers[fixerId];
        }
    });

    return validated;
}