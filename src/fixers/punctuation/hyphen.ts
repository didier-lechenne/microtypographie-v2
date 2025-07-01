// src/fixers/punctuation/hyphen.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les césures et tirets typographiques avancés
 * Implémentation basique - les vraies règles de césure sont très complexes
 * Désactivé par défaut car nécessite un dictionnaire de césure complet
 */
export class Hyphen extends BaseFixer {
    public readonly id = 'Hyphen';
    public readonly name = 'Césures typographiques';
    public readonly description = 'Améliore les tirets et césures (fonctionnalité basique)';
    public readonly category = 'punctuation' as const;
    public readonly priority = 10;

    public enabled = false; // Désactivé par défaut - règles complexes

    /**
     * Applique quelques transformations basiques de tirets
     * Note: Les vraies règles de césure nécessiteraient un dictionnaire complet
     */
    public fix(text: string): string {
        // Implémentation très basique - juste quelques améliorations de tirets
        const transforms = [
            // Corriger les tirets mal espacés dans les dialogues français
            {
                pattern: /^(\s*)-\s*/gm,
                replacement: this.isLocaleCompatible(['fr']) 
                    ? `$1${UNICODE_CHARS.MDASH} ` 
                    : `$1${UNICODE_CHARS.MDASH}`
            },
            // Tirets dans les énumérations
            {
                pattern: /(\n\s*)-\s+/g,
                replacement: `$1${UNICODE_CHARS.MDASH} `
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: '- Premier point\n- Deuxième point\n- Dialogue',
            after: `${UNICODE_CHARS.MDASH} Premier point\n${UNICODE_CHARS.MDASH} Deuxième point\n${UNICODE_CHARS.MDASH} Dialogue`
        };
    }
}