// src/fixers/quotes/smart-quotes.ts
import { Editor } from 'obsidian';
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les guillemets intelligents
 */
export class SmartQuotes extends BaseFixer {
    public readonly id = 'SmartQuotes';
    public readonly name = 'Guillemets intelligents';
    public readonly description = 'Convertit les guillemets droits en guillemets typographiques';
    public readonly category = 'quotes' as const;
    public readonly priority = 4;

    public fix(text: string): string {
        if (this.isLocaleCompatible(['fr'])) {
            return this.fixFrenchQuotes(text);
        } else {
            return this.fixEnglishQuotes(text);
        }
    }

    private fixFrenchQuotes(text: string): string {
        let result = text;
        
       
        if (this.isGuillemetsEnabled()) {
            result = result.replace(/<</g, `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}`);
            result = result.replace(/>>/g, `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO}`);
        }
        
        let inQuote = false;
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}`;
            } else {
                inQuote = false;
                return `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO}`;
            }
        });



        result = result.replace(
            /(«\u202F[^»]*)'([^']*)'([^»]*\u202F»)/g,
            `$1${UNICODE_CHARS.LDQUO}$2${UNICODE_CHARS.RDQUO}$3`
        );
        

        // result = result.replace(
        //     /(«\u202F[^»]*)'([^']*)'([^»]*\u202F»)/g,
        //     `$1${UNICODE_CHARS.LDQUO}$2${UNICODE_CHARS.RDQUO}$3`
        // );
        


        result = result.replace(
            /(«\u202F[^»]*)«\u202F([^»]*)\u202F»([^»]*\u202F»)/g,
            `$1${UNICODE_CHARS.LDQUO}$2${UNICODE_CHARS.RDQUO}$3`
        );

        result = result.replace(/'/g, UNICODE_CHARS.RSQUO);
        return result;
    }

    private fixEnglishQuotes(text: string): string {
        let result = text;
        let inQuote = false;
        
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return UNICODE_CHARS.LDQUO;
            } else {
                inQuote = false;
                return UNICODE_CHARS.RDQUO;
            }
        });
        
        result = result.replace(/(\w)'/g, `$1${UNICODE_CHARS.RSQUO}`);
        return result;
    }

    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (this.isLocaleCompatible(['fr']) && this.isGuillemetsEnabled()) {
            if (event.key === '<' || event.key === '>') {
                return this.handleAngleBracket(event, editor);
            }
        }
        return false;
    }

    private handleAngleBracket(event: KeyboardEvent, editor: Editor): boolean {
        if (event.ctrlKey || event.metaKey) return false;

        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const beforeCursor = line.substring(0, cursor.ch);
        
        if (event.key === '<' && beforeCursor.endsWith('<')) {
            const newLine = line.substring(0, cursor.ch - 1) + 
                           `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}` + 
                           line.substring(cursor.ch);
            
            editor.setLine(cursor.line, newLine);
            editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
            return true;
        }
        
        if (event.key === '>' && beforeCursor.endsWith('>')) {
            const newLine = line.substring(0, cursor.ch - 1) + 
                           `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO}` + 
                           line.substring(cursor.ch);
            
            editor.setLine(cursor.line, newLine);
            editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
            return true;
        }
        
        return false;
    }

    public getExample(): FixerExample {
        if (this.isLocaleCompatible(['fr'])) {
            return {
                before: 'Il a dit "Bonjour" et <<Il m\'a dit \'Salut\' hier>>.',
                after: `Il a dit ${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}Bonjour${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO} et ${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}Il m${UNICODE_CHARS.RSQUO}a dit ${UNICODE_CHARS.LDQUO}Salut${UNICODE_CHARS.RDQUO} hier${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO}.`
            };
        } else if (this.isLocaleCompatible(['en'])) {
            return {
                before: 'He said "Hello" and it\'s done.',
                after: `He said ${UNICODE_CHARS.LDQUO}Hello${UNICODE_CHARS.RDQUO} and it${UNICODE_CHARS.RSQUO}s done.`
            };
        } else {
            return {
                before: 'Er sagte "Hallo" und es ist \'fertig\'.',
                after: `Er sagte ${UNICODE_CHARS.LDQUO}Hallo${UNICODE_CHARS.RDQUO} und es ist ${UNICODE_CHARS.RSQUO}fertig${UNICODE_CHARS.RSQUO}.`
            };
        }
    }
}