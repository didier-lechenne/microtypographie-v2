// src/fixers/index.ts

// Export de la classe de base
export { BaseFixer } from './base/base-fixer';

// Export des fixers de ponctuation
export { Ellipsis } from './punctuation/ellipsis';
export { Dash } from './punctuation/dash';
export { HyphenFixer } from './punctuation/hyphen';

// Export des fixers d'espacement
export { FrenchNoBreakSpace } from './spacing/french-spacing';
export { NoSpaceBeforeComma } from './spacing/comma';
export { UnitFixer } from './spacing/unit';
export { DimensionFixer } from './spacing/dimension';

// Export des fixers de guillemets
export { SmartQuotesFixer } from './quotes/smart-quotes';
export { CurlyQuoteFixer } from './quotes/curly-quote';

// Export des fixers de symboles
export { TrademarkFixer } from './symbols/trademark';

// Import pour l'usage interne
import { Ellipsis } from './punctuation/ellipsis';
import { Dash } from './punctuation/dash';
import { HyphenFixer } from './punctuation/hyphen';
import { FrenchNoBreakSpace } from './spacing/french-spacing';
import { NoSpaceBeforeComma } from './spacing/comma';
import { UnitFixer } from './spacing/unit';
import { DimensionFixer } from './spacing/dimension';
import { SmartQuotesFixer } from './quotes/smart-quotes';
import { CurlyQuoteFixer } from './quotes/curly-quote';
import { TrademarkFixer } from './symbols/trademark';

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
        new SmartQuotesFixer(),   // priorité 4
        new CurlyQuoteFixer(),    // priorité 5
        new NoSpaceBeforeComma(), // priorité 6
        new UnitFixer(),          // priorité 7
        new DimensionFixer(),     // priorité 8
        new TrademarkFixer(),     // priorité 9
        new HyphenFixer(),        // priorité 10 (désactivé par défaut)
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
            new HyphenFixer(),
        ];
    },

    /**
     * Crée tous les fixers d'espacement
     */
    createSpacingFixers(): TypographicFixer[] {
        return [
            new FrenchNoBreakSpace(),
            new NoSpaceBeforeComma(),
            new UnitFixer(),
            new DimensionFixer(),
        ];
    },

    /**
     * Crée tous les fixers de guillemets
     */
    createQuoteFixers(): TypographicFixer[] {
        return [
            new SmartQuotesFixer(),
            new CurlyQuoteFixer(),
        ];
    },

    /**
     * Crée tous les fixers de symboles
     */
    createSymbolFixers(): TypographicFixer[] {
        return [
            new TrademarkFixer(),
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
            new SmartQuotesFixer(),
            new CurlyQuoteFixer(),
            new UnitFixer(),
            new DimensionFixer(),
            new TrademarkFixer(),
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
            new SmartQuotesFixer(),
            new CurlyQuoteFixer(),
            new UnitFixer(),
            new DimensionFixer(),
            new TrademarkFixer(),
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