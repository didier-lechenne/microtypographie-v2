// src/fixers/quotes/curly-quote.ts
import { Editor } from 'obsidian';
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les apostrophes courbes (CurlyQuote)
 * Convertit les apostrophes droites ' en apostrophes typographiques '
 * Basé sur le fixer CurlyQuote de JoliTypo
 * @see https://github.com/jolicode/JoliTypo/blob/main/src/JoliTypo/Fixer/CurlyQuote.php
 */
export class CurlyQuoteFixer extends BaseFixer {
    public readonly id = 'CurlyQuote';
    public readonly name = 'Apostrophes courbes';
    public readonly description = 'Convertit les apostrophes droites \' en apostrophes typographiques \'';
    public readonly category = 'quotes' as const;
    public readonly priority = 5;

    /**
     * Transforme les apostrophes droites en apostrophes courbes
     * Logique JoliTypo : cherche [lettre]' et remplace par [lettre]'
     */
    public fix(text: string): string {
        // Pattern exact de JoliTypo : ([a-z])' avec flags insensible à la casse et multiline
        // Remplace une apostrophe droite précédée d'une lettre par une apostrophe courbe
        return this.applyRegexTransform(
            text,
            /([a-z])'/gim,
            `$1${UNICODE_CHARS.RSQUO}`
        );
    }

    /**
     * Gère la saisie en temps réel des apostrophes
     */
    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (event.key === "'" && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Vérifier si le caractère précédent est une lettre
            const lastChar = beforeCursor.slice(-1);
            if (lastChar && /[a-zA-Z]/.test(lastChar)) {
                // Remplacer l'apostrophe droite par une apostrophe courbe
                const newLine = beforeCursor + UNICODE_CHARS.RSQUO + line.substring(cursor.ch);
                
                editor.setLine(cursor.line, newLine);
                editor.setCursor({ 
                    line: cursor.line, 
                    ch: cursor.ch + 1
                });
                
                return true; // Empêcher l'insertion de l'apostrophe droite
            }
        }
        return false;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: "I'm happy, you're great, it's working!",
            after: `I${UNICODE_CHARS.RSQUO}m happy, you${UNICODE_CHARS.RSQUO}re great, it${UNICODE_CHARS.RSQUO}s working!`
        };
    }
}