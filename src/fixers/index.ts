// src/fixers/index.ts

// Export de la classe de base
export { BaseFixer } from './base/base-fixer';

// Export des fixers de ponctuation
export { Ellipsis } from './punctuation/ellipsis';
export { Dash } from './punctuation/dash';
export { Hyphen } from './punctuation/hyphen';

// Export des fixers d'espacement
export { FrenchNoBreakSpace } from './spacing/french-spacing';
export { NoSpaceBeforeComma } from './spacing/comma';
export { Unit } from './spacing/unit';
export { Dimension } from './spacing/dimension';

// Export des fixers de guillemets
export { SmartQuotes } from './quotes/smart-quotes';
export { CurlyQuote } from './quotes/curly-quote';

// Export des fixers de symboles
export { Trademark } from './symbols/trademark';

// Import pour l'usage interne
import { Ellipsis } from './punctuation/ellipsis';
import { Dash } from './punctuation/dash';
import { FrenchNoBreakSpace } from './spacing/french-spacing';
import { SmartQuotes } from './quotes/smart-quotes';
import { CurlyQuote } from './quotes/curly-quote';
import { NoSpaceBeforeComma } from './spacing/comma';
import { Unit } from './spacing/unit';
import { Dimension } from './spacing/dimension';
import { Trademark } from './symbols/trademark';
import { Hyphen } from './punctuation/hyphen';

import { TypographicFixer } from '../types/interfaces';

/**
 * Factory pour créer tous les fixers disponibles
 * @returns Liste de tous les fixers instanciés
 */
export function createAllFixers(): TypographicFixer[] {
    return [
        // Ordre par priorité croissante
        new Ellipsis(),           // priorité 1
        new Dash(),               // priorité 2
        new FrenchNoBreakSpace(), // priorité 3
        new SmartQuotes(),   // priorité 4
        new CurlyQuote(),    // priorité 5
        new NoSpaceBeforeComma(), // priorité 6
        new Unit(),          // priorité 7
        new Dimension(),     // priorité 8
        new Trademark(),     // priorité 9
        new Hyphen(),        // priorité 10 (désactivé par défaut)
    ];
}

/**
 * Factory pour créer les fixers par catégorie
 */
export const FixerFactories = {
    /**
     * Crée tous les fixers de ponctuation
     */
    createPunctuationFixers(): TypographicFixer[] {
        return [
            new Ellipsis(),
            new Dash(),
            new Hyphen(),
        ];
    },

    /**
     * Crée tous les fixers d'espacement
     */
    createSpacingFixers(): TypographicFixer[] {
        return [
            new FrenchNoBreakSpace(),
            new NoSpaceBeforeComma(),
            new Unit(),
            new Dimension(),
        ];
    },

    /**
     * Crée tous les fixers de guillemets
     */
    createQuoteFixers(): TypographicFixer[] {
        return [
            new SmartQuotes(),
            new CurlyQuote(),
        ];
    },

    /**
     * Crée tous les fixers de symboles
     */
    createSymbolFixers(): TypographicFixer[] {
        return [
            new Trademark(),
        ];
    },

    /**
     * Crée les fixers essentiels pour le français
     * Correspond à la configuration JoliTypo fr_FR
     */
    createFrenchEssentialFixers(): TypographicFixer[] {
        return [
            new Ellipsis(),
            new Dash(),
            new FrenchNoBreakSpace(),
            new SmartQuotes(),
            new CurlyQuote(),
            new Unit(),
            new Dimension(),
            new Trademark(),
            new NoSpaceBeforeComma(),
            // Note: Hyphen désactivé par défaut car complexe
        ];
    },

    /**
     * Crée les fixers essentiels pour l'anglais
     * Correspond à la configuration JoliTypo en_GB
     */
    createEnglishEssentialFixers(): TypographicFixer[] {
        return [
            new Ellipsis(),
            new Dash(),
            new SmartQuotes(),
            new CurlyQuote(),
            new Unit(),
            new Dimension(),
            new Trademark(),
            new NoSpaceBeforeComma(),
            // Note: Hyphen désactivé par défaut
        ];
    }
};

/**
 * Métadonnées sur les fixers disponibles
 */
export const FixerMetadata = {
    totalCount: 10, // Nombre total de fixers implémentés
    categories: ['punctuation', 'spacing', 'quotes', 'symbols'] as const,
    
    getCategoryCount(category: string): number {
        const categoryMap: Record<string, number> = {
            'punctuation': 3,   // Ellipsis, Dash, Hyphen
            'spacing': 4,       // FrenchNoBreakSpace, NoSpaceBeforeComma, Unit, Dimension
            'quotes': 2,        // SmartQuotes, CurlyQuote  
            'symbols': 1        // Trademark
        };
        return categoryMap[category] || 0;
    },

    getFixerIds(): string[] {
        return [
            'Ellipsis',
            'Dash',
            'Hyphen', 
            'FrenchNoBreakSpace',
            'NoSpaceBeforeComma',
            'Unit',
            'Dimension',
            'SmartQuotes',
            'CurlyQuote',
            'Trademark'
        ];
    },

    /**
     * Retourne les fixers recommandés par locale (comme JoliTypo)
     */
    getRecommendedFixersForLocale(locale: string): string[] {
        const localeMap: Record<string, string[]> = {
            'fr_FR': ['Ellipsis', 'Dimension', 'Unit', 'Dash', 'SmartQuotes', 'FrenchNoBreakSpace', 'NoSpaceBeforeComma', 'CurlyQuote', 'Trademark'],
            'fr_CA': ['Ellipsis', 'Dimension', 'Unit', 'Dash', 'SmartQuotes', 'NoSpaceBeforeComma', 'CurlyQuote', 'Trademark'],
            'en_GB': ['Ellipsis', 'Dimension', 'Unit', 'Dash', 'SmartQuotes', 'NoSpaceBeforeComma', 'CurlyQuote', 'Trademark'],
            'de_DE': ['Ellipsis', 'Dimension', 'Unit', 'Dash', 'SmartQuotes', 'NoSpaceBeforeComma', 'CurlyQuote', 'Trademark']
        };
        return localeMap[locale] || localeMap['fr_FR'];
    }
};