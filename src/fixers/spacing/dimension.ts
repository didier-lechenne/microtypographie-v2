// src/fixers/spacing/dimension.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les dimensions et multiplications
 * Convertit les signes de multiplication textuels en symbole × Unicode
 * Inspiré du fixer "Dimension" de JoliTypo
 */
export class Dimension extends BaseFixer {
    public readonly id = 'Dimension';
    public readonly name = 'Symboles de multiplication';
    public readonly description = 'Convertit x et * entre nombres en symbole × (12 x 34 → 12×34)';
    public readonly category = 'spacing' as const;
    public readonly priority = 8;

    public enabled = true;

    /**
     * Applique les transformations de multiplication
     */
    public fix(text: string): string {
        const transforms = [
            // Multiplication avec 'x' ou 'X' entre nombres
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*[xX]\s*(\d+(?:[,.]?\d+)?)/g,
                replacement: `$1${UNICODE_CHARS.TIMES}$2`
            },
            // Multiplication avec '*' entre nombres
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*\*\s*(\d+(?:[,.]?\d+)?)/g,
                replacement: `$1${UNICODE_CHARS.TIMES}$2`
            },
            // Dimensions (longueur x largeur x hauteur)
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*[xX]\s*(\d+(?:[,.]?\d+)?)\s*[xX]\s*(\d+(?:[,.]?\d+)?)/g,
                replacement: `$1${UNICODE_CHARS.TIMES}$2${UNICODE_CHARS.TIMES}$3`
            },
            // Format "dimensions" avec unités (ex: 12cm x 34cm)
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*([a-zA-Z]+)\s*[xX]\s*(\d+(?:[,.]?\d+)?)\s*([a-zA-Z]+)?/g,
                replacement: `$1$2${UNICODE_CHARS.TIMES}$3$4`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Vérifie si le contexte est valide (éviter de modifier le code, variables, etc.)
     */
    protected isValidContext(text: string, position: number): boolean {
        if (!super.isValidContext(text, position)) {
            return false;
        }

        // Éviter les cas comme "Matrix", "Linux", etc.
        const beforeContext = text.substring(Math.max(0, position - 10), position);
        const afterContext = text.substring(position, Math.min(text.length, position + 10));
        
        // Ne pas traiter si c'est dans un mot
        if (beforeContext.match(/[a-zA-Z]$/) && afterContext.match(/^[a-zA-Z]/)) {
            return false;
        }

        return true;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Résolution: 1920 x 1080, format 16 * 9, dimensions 12cm x 34cm x 56cm',
            after: `Résolution: 1920${UNICODE_CHARS.TIMES}1080, format 16${UNICODE_CHARS.TIMES}9, dimensions 12cm${UNICODE_CHARS.TIMES}34cm${UNICODE_CHARS.TIMES}56cm`
        };
    }
}