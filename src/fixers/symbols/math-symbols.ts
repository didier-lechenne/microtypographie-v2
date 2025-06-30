// src/fixers/symbols/math-symbols.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les symboles mathématiques et de marque
 * Convertit les expressions courantes en symboles Unicode appropriés
 */
export class MathSymbolsFixer extends BaseFixer {
    public readonly id = 'math-symbols';
    public readonly name = 'Symboles mathématiques';
    public readonly description = 'Convertit x entre nombres en × et améliore d\'autres symboles';
    public readonly category = 'symbols' as const;
    public readonly priority = 5;

    public enabled = false; // Désactivé par défaut (moins prioritaire)

    /**
     * Applique les transformations de symboles
     */
    public fix(text: string): string {
        const transforms = [
            // Symbole multiplication : x entre nombres devient ×
            {
                pattern: /(\d+)\s*x\s*(\d+)/gi,
                replacement: `$1${UNICODE_CHARS.TIMES}$2`
            },
            // Symbole multiplication : * entre nombres devient ×
            {
                pattern: /(\d+)\s*\*\s*(\d+)/g,
                replacement: `$1${UNICODE_CHARS.TIMES}$2`
            },
            // Symboles de marque
            {
                pattern: /\(tm\)/gi,
                replacement: UNICODE_CHARS.TRADE
            },
            {
                pattern: /\(r\)/gi,
                replacement: UNICODE_CHARS.REG
            },
            {
                pattern: /\(c\)/gi,
                replacement: UNICODE_CHARS.COPY
            },
            // Degrés
            {
                pattern: /(\d+)\s*degrees?/gi,
                replacement: `$1${UNICODE_CHARS.DEGREE}`
            },
            {
                pattern: /(\d+)\s*°/g,
                replacement: `$1${UNICODE_CHARS.DEGREE}`
            },
            // Plus ou moins
            {
                pattern: /\+\/-/g,
                replacement: UNICODE_CHARS.PLUS_MINUS
            },
            {
                pattern: /\+\s*-/g,
                replacement: UNICODE_CHARS.PLUS_MINUS
            },
            // Division
            {
                pattern: /(\d+)\s*\/\s*(\d+)/g,
                replacement: `$1${UNICODE_CHARS.DIVIDE}$2`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Matrice 3 x 4, température 20 degrees (c) 2024',
            after: `Matrice 3${UNICODE_CHARS.TIMES}4, température 20${UNICODE_CHARS.DEGREE} ${UNICODE_CHARS.COPY} 2024`
        };
    }
}