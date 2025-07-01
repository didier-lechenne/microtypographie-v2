// src/fixers/index.ts

// Export de la classe de base
export { BaseFixer } from './base/base-fixer';

// Export des fixers de ponctuation
export { Ellipsis } from './punctuation/ellipsis';
export { Dash } from './punctuation/dash';

// Export des fixers d'espacement
export { FrenchNoBreakSpace } from './spacing/french-spacing';
export { NoSpaceBeforeComma } from './spacing/comma';

// Export des fixers de guillemets
export { SmartQuotesFixer } from './quotes/smart-quotes';



// Import pour l'usage interne
import { Ellipsis } from './punctuation/ellipsis';
import { Dash } from './punctuation/dash';
import { FrenchNoBreakSpace } from './spacing/french-spacing';
import { NoSpaceBeforeComma } from './spacing/comma';
import { SmartQuotesFixer } from './quotes/smart-quotes';


import { TypographicFixer } from '../types/interfaces';

/**
 * Factory pour créer tous les fixers disponibles
 * @returns Liste de tous les fixers instanciés
 */
export function createAllFixers(): TypographicFixer[] {
    return [
        new Ellipsis(),
        new Dash(),
        new FrenchNoBreakSpace(),
        new NoSpaceBeforeComma(),
        new SmartQuotesFixer(),
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
        ];
    },

    /**
     * Crée tous les fixers d'espacement
     */
    createSpacingFixers(): TypographicFixer[] {
        return [
            new FrenchNoBreakSpace(),
            new NoSpaceBeforeComma(),
        ];
    },

    /**
     * Crée tous les fixers de guillemets
     */
    createQuoteFixers(): TypographicFixer[] {
        return [
            new SmartQuotesFixer(),
        ];
    },



    /**
     * Crée les fixers essentiels pour le français
     */
    createFrenchEssentialFixers(): TypographicFixer[] {
        return [
            new Ellipsis(),
            new Dash(),
            new FrenchNoBreakSpace(),
            new SmartQuotesFixer(),
            new NoSpaceBeforeComma(),
        ];
    },

    /**
     * Crée les fixers essentiels pour l'anglais
     */
    createEnglishEssentialFixers(): TypographicFixer[] {
        return [
            new Ellipsis(),
            new Dash(),
            new SmartQuotesFixer(),
            new NoSpaceBeforeComma(),
        ];
    }
};

/**
 * Métadonnées sur les fixers disponibles
 */
export const FixerMetadata = {
    totalCount: 5,
    categories: ['punctuation', 'spacing', 'quotes', 'symbols'] as const,
    
    getCategoryCount(category: string): number {
        const categoryMap: Record<string, number> = {
            'punctuation': 2,
            'spacing': 2,
            'quotes': 1,
            'symbols': 1
        };
        return categoryMap[category] || 0;
    },

    getFixerIds(): string[] {
        return [
            'ellipsis',
            'dash', 
            'french-spacing',
            'comma',
            'smart-quotes'
        ];
    }
};