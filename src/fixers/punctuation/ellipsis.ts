// src/fixers/punctuation/ellipsis.ts
import { Editor } from 'obsidian';
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS, UNICODE_PATTERNS } from '../../constants/unicode';

/**
 * Fixer pour les points de suspension
 * Convertit ... en … (caractère Unicode unique)
 */
export class Ellipsis extends BaseFixer {
    public readonly id = 'Ellipsis';
    public readonly name = 'Points de suspension';
    public readonly description = 'Remplace ... par le caractère ellipse Unicode (…)';
    public readonly category = 'punctuation' as const;
    public readonly priority = 1;

    /**
     * Transforme les points multiples en ellipse Unicode
     */
    public fix(text: string): string {
        return this.applyRegexTransform(
            text,
            UNICODE_PATTERNS.ELLIPSIS_DOTS,
            UNICODE_CHARS.ELLIPSIS
        );
    }

    /**
     * Gère la saisie en temps réel des points de suspension
     */
    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (event.key === '.' && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Vérifier si on a déjà deux points consécutifs
            if (beforeCursor.endsWith('..')) {
                // Remplacer les trois points par une ellipse
                const newLine = line.substring(0, cursor.ch - 2) + 
                               UNICODE_CHARS.ELLIPSIS + 
                               line.substring(cursor.ch);
                
                editor.setLine(cursor.line, newLine);
                editor.setCursor({ 
                    line: cursor.line, 
                    ch: cursor.ch - 1 // Position après l'ellipse
                });
                
                return true; // Empêcher l'insertion du troisième point
            }
        }
        return false;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'En fait... c\'est compliqué...',
            after: `En fait${UNICODE_CHARS.ELLIPSIS} c'est compliqué${UNICODE_CHARS.ELLIPSIS}`
        };
    }
}