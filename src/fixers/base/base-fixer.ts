// src/fixers/base/base-fixer.ts
import { Editor } from 'obsidian';
import { TypographicFixer, FixerCategory, FixerExample } from '../../types/interfaces';

/**
 * Classe de base abstraite pour tous les fixers typographiques
 */
export abstract class BaseFixer implements TypographicFixer {
    public abstract readonly id: string;
    public abstract readonly name: string;
    public abstract readonly description: string;
    public abstract readonly category: FixerCategory;
    public abstract readonly priority: number;
    
    public enabled: boolean = true;
    protected locale: string = 'fr-FR';

    /**
     * Méthode principale de correction - doit être implémentée
     */
    public abstract fix(text: string): string;

    /**
     * Configuration de la locale (optionnelle)
     */
    public setLocale(locale: string): void {
        this.locale = locale;
    }

    /**
     * Gestion des événements clavier (optionnelle)
     * À surcharger dans les classes enfants si nécessaire
     */
    public handleKeyEvent?(event: KeyboardEvent, editor: Editor): boolean;

    /**
     * Exemple de transformation (optionnel)
     * À surcharger dans les classes enfants
     */
    public getExample?(): FixerExample;

    /**
     * Vérifie si le fixer est compatible avec la locale actuelle
     */
    protected isLocaleCompatible(targetLocales: string[]): boolean {
        return targetLocales.some(locale => 
            this.locale.startsWith(locale)
        );
    }

    /**
     * Vérifie si le fixer est activé et compatible
     */
    public isActive(): boolean {
        return this.enabled;
    }

    /**
     * Applique une transformation regex avec remplacement par chaîne
     */
    protected applyRegexTransform(text: string, pattern: RegExp, replacement: string): string;
    /**
     * Applique une transformation regex avec remplacement par fonction
     */
    protected applyRegexTransform(text: string, pattern: RegExp, replacement: (substring: string, ...args: any[]) => string): string;
    /**
     * Applique une transformation regex simple - implémentation
     */
    protected applyRegexTransform(
        text: string, 
        pattern: RegExp, 
        replacement: string | ((substring: string, ...args: any[]) => string)
    ): string {
        if (typeof replacement === 'string') {
            return text.replace(pattern, replacement);
        } else {
            return text.replace(pattern, replacement);
        }
    }

    /**
     * Applique plusieurs transformations regex en séquence
     */
    protected applyMultipleTransforms(
        text: string, 
        transforms: Array<{
            pattern: RegExp, 
            replacement: string | ((substring: string, ...args: any[]) => string)
        }>
    ): string {
        return transforms.reduce((result, transform) => {
            if (typeof transform.replacement === 'string') {
                return this.applyRegexTransform(result, transform.pattern, transform.replacement);
            } else {
                return this.applyRegexTransform(result, transform.pattern, transform.replacement);
            }
        }, text);
    }

    /**
     * Vérifie si une position dans le texte est dans un contexte valide
     * (pas dans du code, des liens, etc.)
     */
    protected isValidContext(text: string, position: number): boolean {
        // Vérifications basiques pour éviter de modifier le code inline
        const beforeContext = text.substring(Math.max(0, position - 10), position);
        const afterContext = text.substring(position, Math.min(text.length, position + 10));
        
        // Éviter le code inline markdown
        if (beforeContext.includes('`') && afterContext.includes('`')) {
            return false;
        }
        
        // Éviter les liens markdown
        if (beforeContext.includes('[') && afterContext.includes(']')) {
            return false;
        }
        
        return true;
    }

    /**
     * Méthode utilitaire pour logger les corrections (développement)
     */
    protected logCorrection(original: string, corrected: string): void {
        if (original !== corrected) {
            console.debug(`[${this.id}] "${original}" → "${corrected}"`);
        }
    }
}