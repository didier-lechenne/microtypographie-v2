// src/fixers/quotes/smart-quotes.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les guillemets intelligents
 * Convertit les guillemets droits en guillemets typographiques
 * Adapte le style selon la langue (français = « », anglais = " ")
 */
export class SmartQuotesFixer extends BaseFixer {
    public readonly id = 'smart-quotes';
    public readonly name = 'Guillemets intelligents';
    public readonly description = 'Convertit les guillemets droits en guillemets typographiques';
    public readonly category = 'quotes' as const;
    public readonly priority = 4;

    /**
     * Applique les guillemets intelligents selon la langue
     */
    public fix(text: string): string {
        if (this.isLocaleCompatible(['fr'])) {
            return this.fixFrenchQuotes(text);
        } else {
            return this.fixEnglishQuotes(text);
        }
    }

    /**
     * Applique les guillemets français « »
     */
    private fixFrenchQuotes(text: string): string {
        let result = text;
        let inQuote = false;
        
        // Transformer les guillemets droits en guillemets français
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_SPACE}`;
            } else {
                inQuote = false;
                return `${UNICODE_CHARS.NO_BREAK_SPACE}${UNICODE_CHARS.RAQUO}`;
            }
        });
        
        // Transformer les apostrophes droites en apostrophes typographiques
        result = result.replace(/'/g, UNICODE_CHARS.RSQUO);
        
        return result;
    }

    /**
     * Applique les guillemets anglais " "
     */
    private fixEnglishQuotes(text: string): string {
        let result = text;
        let inQuote = false;
        
        // Transformer les guillemets droits en guillemets anglais
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return UNICODE_CHARS.LDQUO;
            } else {
                inQuote = false;
                return UNICODE_CHARS.RDQUO;
            }
        });
        
        // Transformer les apostrophes dans les contractions
        result = result.replace(/(\w)'/g, `$1${UNICODE_CHARS.RSQUO}`);
        
        return result;
    }

    /**
     * Fournit un exemple selon la langue
     */
    public getExample(): FixerExample {
        if (this.isLocaleCompatible(['fr'])) {
            return {
                before: 'Il a dit "Bonjour" et c\'est parti.',
                after: `Il a dit ${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_SPACE}Bonjour${UNICODE_CHARS.NO_BREAK_SPACE}${UNICODE_CHARS.RAQUO} et c${UNICODE_CHARS.RSQUO}est parti.`
            };
        } else {
            return {
                before: 'He said "Hello" and it\'s done.',
                after: `He said ${UNICODE_CHARS.LDQUO}Hello${UNICODE_CHARS.RDQUO} and it${UNICODE_CHARS.RSQUO}s done.`
            };
        }
    }
}