// src/fixers/index.ts

// Export de la classe de base
export { BaseFixer } from './base/base-fixer';

// Export des fixers de ponctuation
export { EllipsisFixer } from './punctuation/ellipsis';
export { DashFixer } from './punctuation/dash';

// Export des fixers d'espacement
export { FrenchSpacingFixer } from './spacing/french-spacing';
export { CommaFixer } from './spacing/comma';

// Export des fixers de guillemets
export { SmartQuotesFixer } from './quotes/smart-quotes';

// Export des fixers de symboles
export { MathSymbolsFixer } from './symbols/math-symbols';

// Import pour l'usage interne
import { EllipsisFixer } from './punctuation/ellipsis';
import { DashFixer } from './punctuation/dash';
import { FrenchSpacingFixer } from './spacing/french-spacing';
import { CommaFixer } from './spacing/comma';
import { SmartQuotesFixer } from './quotes/smart-quotes';
import { MathSymbolsFixer } from './symbols/math-symbols';

import { TypographicFixer } from '../types/interfaces';

/**
 * Factory pour créer tous les fixers disponibles
 * @returns Liste de tous les fixers instanciés
 */
export function createAllFixers(): TypographicFixer[] {
    return [
        new EllipsisFixer(),
        new DashFixer(),
        new FrenchSpacingFixer(),
        new CommaFixer(),
        new SmartQuotesFixer(),
        new MathSymbolsFixer(),
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
            new EllipsisFixer(),
            new DashFixer(),
        ];
    },

    /**
     * Crée tous les fixers d'espacement
     */
    createSpacingFixers(): TypographicFixer[] {
        return [
            new FrenchSpacingFixer(),
            new CommaFixer(),
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
     * Crée tous les fixers de symboles
     */
    createSymbolFixers(): TypographicFixer[] {
        return [
            new MathSymbolsFixer(),
        ];
    },

    /**
     * Crée les fixers essentiels pour le français
     */
    createFrenchEssentialFixers(): TypographicFixer[] {
        return [
            new EllipsisFixer(),
            new DashFixer(),
            new FrenchSpacingFixer(),
            new SmartQuotesFixer(),
            new CommaFixer(),
        ];
    },

    /**
     * Crée les fixers essentiels pour l'anglais
     */
    createEnglishEssentialFixers(): TypographicFixer[] {
        return [
            new EllipsisFixer(),
            new DashFixer(),
            new SmartQuotesFixer(),
            new CommaFixer(),
        ];
    }
};

/**
 * Métadonnées sur les fixers disponibles
 */
export const FixerMetadata = {
    totalCount: 6,
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
            'no-space-comma',
            'smart-quotes',
            'math-symbols'
        ];
    }
};