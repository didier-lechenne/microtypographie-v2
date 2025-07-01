// src/fixers/spacing/comma.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';

/**
 * Fixer pour l'espacement des virgules
 * Supprime les espaces avant les virgules et normalise l'espacement après
 */
export class CommaFixer extends BaseFixer {
    public readonly id = 'comma';
    public readonly name = 'Virgules sans espace';
    public readonly description = 'Supprime les espaces avant les virgules et normalise l\'espacement';
    public readonly category = 'spacing' as const;
    public readonly priority = 6;

    /**
     * Corrige l'espacement autour des virgules
     */
    public fix(text: string): string {
        const transforms = [
            // Supprimer les espaces avant les virgules
            {
                pattern: /\s+,/g,
                replacement: ','
            },
            // Normaliser l'espacement après les virgules (exactement un espace)
            {
                pattern: /,\s*/g,
                replacement: ', '
            },
            // Cas particulier : virgule en fin de ligne (pas d'espace après)
            {
                pattern: /,\s*$/gm,
                replacement: ','
            },
            // Cas particulier : virgule avant fermeture de parenthèse/crochet
            {
                pattern: /,\s*([)\]}])/g,
                replacement: ',$1'
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Pommes , poires,oranges ,bananes',
            after: 'Pommes, poires, oranges, bananes'
        };
    }
}