// src/fixers/spacing/unit.ts
import { BaseFixer } from '../base/base-fixer';
import { FixerExample } from '../../types/interfaces';
import { UNICODE_CHARS } from '../../constants/unicode';

/**
 * Fixer pour les espaces avant les unités
 * Ajoute des espaces insécables entre les nombres et leurs unités
 * Inspiré du fixer "Unit" de JoliTypo
 */
export class UnitFixer extends BaseFixer {
    public readonly id = 'unit';
    public readonly name = 'Espaces avant unités';
    public readonly description = 'Ajoute des espaces insécables entre nombres et unités (12 h, 50 €, 25 %)';
    public readonly category = 'spacing' as const;
    public readonly priority = 7;

    public enabled = true;

    /**
     * Applique les espaces insécables avant les unités
     */
    public fix(text: string): string {
        const transforms = [
            // === UNITÉS DE TEMPS ===
            {
                pattern: /(\d+)\s*([hms])\b(?![a-zA-Z])/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Unités complètes de temps
            {
                pattern: /(\d+)\s*(heures?|minutes?|secondes?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },

            // === UNITÉS MONÉTAIRES ===
            {
                pattern: /(\d+)\s*([€$£¥₹₽])/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Unités monétaires écrites
            {
                pattern: /(\d+)\s*(euros?|dollars?|livres?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },

            // === POURCENTAGES ===
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*%/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}%`
            },

            // === UNITÉS SI ET MÉTRIQUES ===
            // Masse
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(mg|[cdk]?g|tonnes?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Distance
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(mm|cm|dm|[dk]?m|km)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Volume
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(ml|[cdk]?l|litres?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Énergie et puissance
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(W|[kmMG]W|kWh?|[kmMG]Wh?)\b/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Fréquence
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(Hz|[kmMG]Hz)\b/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },

            // === TEMPÉRATURES ===
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*°([CF]?)\b/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}°$2`
            },

            // === UNITÉS INFORMATIQUES ===
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*([kmMGT]?[Bb]|[kmMGT]?o)\b/g,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },
            // Unités complètes
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(octets?|bytes?|bits?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },

            // === UNITÉS D'ANGLES ===
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(degrés?|rad|radiants?)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            },

            // === UNITÉS DE VITESSE ===
            {
                pattern: /(\d+(?:[,.]?\d+)?)\s*(km\/h|mph|m\/s)\b/gi,
                replacement: `$1${UNICODE_CHARS.NO_BREAK_SPACE}$2`
            }
        ];

        return this.applyMultipleTransforms(text, transforms);
    }

    /**
     * Vérifie si le contexte est valide pour l'ajout d'espace
     */
    protected isValidContext(text: string, position: number): boolean {
        if (!super.isValidContext(text, position)) {
            return false;
        }

        // Éviter les cas comme "h1", "h2" (titres markdown)
        const beforeContext = text.substring(Math.max(0, position - 5), position);
        const afterContext = text.substring(position, Math.min(text.length, position + 5));
        
        // Ne pas traiter si c'est un titre markdown
        if (beforeContext.match(/^\s*#*\s*\d+$/) && afterContext.match(/^[hH]\d/)) {
            return false;
        }

        return true;
    }

    /**
     * Fournit un exemple de transformation
     */
    public getExample(): FixerExample {
        return {
            before: 'Température: 25 °C, vitesse: 120 km/h, taille: 1.8 m, poids: 75 kg, prix: 299 €',
            after: `Température: 25${UNICODE_CHARS.NO_BREAK_SPACE}°C, vitesse: 120${UNICODE_CHARS.NO_BREAK_SPACE}km/h, taille: 1.8${UNICODE_CHARS.NO_BREAK_SPACE}m, poids: 75${UNICODE_CHARS.NO_BREAK_SPACE}kg, prix: 299${UNICODE_CHARS.NO_BREAK_SPACE}€`
        };
    }
}