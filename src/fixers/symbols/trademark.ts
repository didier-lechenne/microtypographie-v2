// src/fixers/symbols/trademark.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les symboles de marques commerciales
 * Convertit (c), (r), (tm) en symboles Unicode ©, ®, ™
 * Inspiré du fixer "Trademark" de JoliTypo
 */
export class TrademarkFixer extends BaseFixer {
    public readonly id = 'Trademark';
    public readonly name = 'Symboles de marques';
    public readonly description = 'Convertit (c) → ©, (r) → ®, (tm) → ™';
    public readonly category = 'symbols' as const;
    public readonly priority = 9;

    public enabled = true;

    /**
     * Applique les transformations des symboles de marques
     */
    public fix(text: string): string {
        const transforms = [
            // Copyright: (c) ou (C) → ©
            {
                pattern: /\(([cC])\)/g,
                replacement: UNICODE_CHARS.COPY
            },
            // Registered trademark: (r) ou (R) → ®
            {
                pattern: /\(([rR])\)/g,
                replacement: UNICODE_CHARS.REG
            },
            // Trademark: (tm) ou (TM) ou (Tm) → ™
            {
                pattern: /\(([tT][mM])\)/gi,
                replacement: UNICODE_CHARS.TRADE
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Vérifie si le contexte est approprié pour la transformation
     */
    protected isValidContext(text: string, position: number): boolean {
        if (!super.isValidContext(text, position)) {
            return false;
        }

        // Éviter les transformations dans des contextes inappropriés
        const beforeContext = text.substring(Math.max(0, position - 20), position);
        const afterContext = text.substring(position, Math.min(text.length, position + 20));
        
        // Ne pas transformer dans du code ou des URL
        if (beforeContext.includes('http') || beforeContext.includes('www.')) {
            return false;
        }

        // Ne pas transformer dans des expressions régulières ou du code
        if (beforeContext.includes('/') && afterContext.includes('/')) {
            return false;
        }

        return true;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Microsoft (c) 2025, iPhone (r), Google Search (tm)',
            after: `Microsoft ${UNICODE_CHARS.COPY} 2025, iPhone ${UNICODE_CHARS.REG}, Google Search ${UNICODE_CHARS.TRADE}`
        };
    }
}