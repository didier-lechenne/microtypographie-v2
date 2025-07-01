// src/fixers/spacing/french-spacing.ts
import { Editor } from 'obsidian';
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour l'espacement à la française
 * Applique les règles d'espacement selon la typographie française
 */
export class FrenchNoBreakSpace extends BaseFixer {
    public readonly id = 'FrenchNoBreakSpace';
    public readonly name = 'Espaces français';
    public readonly description = 'Ajoute des espaces insécables selon les règles françaises';
    public readonly category = 'spacing' as const;
    public readonly priority = 3;

    public enabled = true; // Activé par défaut pour le français

    /**
     * Applique les règles d'espacement françaises
     */
    public fix(text: string): string {
        // Ne s'applique qu'aux locales françaises
        if (!this.isLocaleCompatible(['fr'])) {
            return text;
        }

        const transforms = [
            // Espace fine insécable avant ; ! ? »
            {
                pattern: /\s*([;!?»])/g,
                replacement: `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}$1`
            },
            // Espace insécable avant :
            {
                pattern: /\s*(:)/g,
                replacement: `${UNICODE_CHARS.NO_BREAK_SPACE}$1`
            },
            // Espace insécable après «
            {
                pattern: /(«)\s*/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_THIN_SPACE}`
            },
            // Corriger les espaces dans les nombres (optionnel)
            {
                pattern: /(\d)\s+(\d{3})/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_THIN_SPACE}$2`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Gère la saisie en temps réel des signes de ponctuation français
     */
    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (!this.isLocaleCompatible(['fr'])) {
            return false;
        }

        const punctuationMap: Record<string, string> = {
            '!': UNICODE_CHARS.NO_BREAK_THIN_SPACE,
            '?': UNICODE_CHARS.NO_BREAK_THIN_SPACE,
            ';': UNICODE_CHARS.NO_BREAK_THIN_SPACE,
            ':': UNICODE_CHARS.NO_BREAK_SPACE
        };

        if (punctuationMap[event.key] && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Enlever l'espace existant s'il y en a un
            const cleanBefore = beforeCursor.replace(/\s+$/, '');
            const spaceChar = punctuationMap[event.key];
            
            const newLine = cleanBefore + spaceChar + event.key + line.substring(cursor.ch);
            
            editor.setLine(cursor.line, newLine);
            editor.setCursor({ 
                line: cursor.line, 
                ch: cleanBefore.length + 2 // Position après la ponctuation
            });
            
            return true;
        }

        return false;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Bonjour ! Comment allez-vous ? Très bien ; merci.',
            after: `Bonjour${UNICODE_CHARS.NO_BREAK_THIN_SPACE}! Comment allez-vous${UNICODE_CHARS.NO_BREAK_THIN_SPACE}? Très bien${UNICODE_CHARS.NO_BREAK_THIN_SPACE}; merci.`
        };
    }
}