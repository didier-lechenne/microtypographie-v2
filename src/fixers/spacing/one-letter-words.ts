// src/fixers/spacing/one-letter-words.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les mots d'une lettre
 * Ajoute des espaces insécables après les mots d'une seule lettre
 * Inspiré des règles typographiques françaises
 */
export class OneLetterWords extends BaseFixer {
    public readonly id = 'OneLetterWords';
    public readonly name = 'Mots d\'une lettre';
    public readonly description = 'Ajoute des espaces insécables après les mots d\'une seule lettre (à, y, etc.)';
    public readonly category = 'spacing' as const;
    public readonly priority = 11;

    public enabled = true;

    /**
     * Applique les espaces insécables après les mots d'une lettre
     */
    public fix(text: string): string {
        // Regex pour détecter les mots d'une lettre entourés d'espaces
        // \s+ = un ou plusieurs espaces avant
        // ([a-zàâäéèêëïîôöùûüÿç]) = capture d'une lettre (avec accents français)
        // \s+ = un ou plusieurs espaces après
        const transforms = [
            {
                pattern: /\s+([a-zàâäéèêëïîôöùûüÿç])\s+/gi,
                replacement: ` $1${UNICODE_CHARS.NO_BREAK_SPACE}`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Je vais à Paris et y rester. Il a dit oui.',
            after: `Je vais à${UNICODE_CHARS.NO_BREAK_SPACE}Paris et y${UNICODE_CHARS.NO_BREAK_SPACE}rester. Il a${UNICODE_CHARS.NO_BREAK_SPACE}dit oui.`
        };
    }
}