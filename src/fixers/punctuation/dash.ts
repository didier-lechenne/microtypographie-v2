// src/fixers/punctuation/dash.ts
import { Editor } from 'obsidian';
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les tirets typographiques
 * Convertit -- en — (tiret cadratin)
 * Convertit les tirets entre nombres en – (tiret demi-cadratin)
 */
export class DashFixer extends BaseFixer {
    public readonly id = 'dash';
    public readonly name = 'Tirets typographiques';
    public readonly description = 'Convertit -- en — et améliore les tirets entre nombres';
    public readonly category = 'punctuation' as const;
    public readonly priority = 2;

    /**
     * Applique les transformations de tirets
     */
    public fix(text: string): string {
        const transforms = [
            // Double tiret vers tiret cadratin
            {
                pattern: /--/g,
                replacement: UNICODE_CHARS.MDASH
            },
            // Tiret entre nombres (dates, plages) vers tiret demi-cadratin
            {
                pattern: /(\d+)\s*-\s*(\d+)/g,
                replacement: `$1${UNICODE_CHARS.NDASH}$2`
            },
            // Espaces autour du tiret cadratin pour le français
            {
                pattern: /\s*—\s*/g,
                replacement: this.isLocaleCompatible(['fr']) 
                    ? ` ${UNICODE_CHARS.MDASH} ` 
                    : `${UNICODE_CHARS.MDASH}`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Gère la saisie en temps réel des doubles tirets
     */
    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (event.key === '-' && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Vérifier si on a déjà un tiret
            if (beforeCursor.endsWith('-')) {
                const replacement = this.isLocaleCompatible(['fr']) 
                    ? ` ${UNICODE_CHARS.MDASH} ` 
                    : `${UNICODE_CHARS.MDASH}`;
                
                const newLine = line.substring(0, cursor.ch - 1) + 
                               replacement + 
                               line.substring(cursor.ch);
                
                editor.setLine(cursor.line, newLine);
                editor.setCursor({ 
                    line: cursor.line, 
                    ch: cursor.ch - 1 + replacement.length
                });
                
                return true;
            }
        }
        return false;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        const beforeDash = this.isLocaleCompatible(['fr']) ? ' — ' : '—';
        
        return {
            before: 'Période 2020-2024 -- une époque importante',
            after: `Période 2020${UNICODE_CHARS.NDASH}2024${beforeDash}une époque importante`
        };
    }
}