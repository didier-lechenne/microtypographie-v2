// src/engine/typography-engine.ts
import { Editor } from 'obsidian';
import { 
    TypographicFixer, 
    TypographySettings, 
    CorrectionResult,
    FixerConfig 
} from '../types/interfaces';
import { createAllFixers } from '../fixers';

/**
 * Moteur principal de correction typographique
 * Gère l'ensemble des fixers et applique les corrections
 */
export class TypographyEngine {
    private fixers: Map<string, TypographicFixer> = new Map();
    private settings: TypographySettings;

    constructor(settings: TypographySettings) {
        this.settings = settings;
        this.initializeFixers();
    }

    /**
     * Initialise tous les fixers disponibles
     */
    private initializeFixers(): void {
        const allFixers = createAllFixers();
        
        allFixers.forEach(fixer => {
            this.fixers.set(fixer.id, fixer);
            
            // Appliquer les paramètres d'activation
            if (fixer.id in this.settings.fixers) {
                fixer.enabled = this.settings.fixers[fixer.id];
            }
            
            // Configurer la locale si le fixer le supporte
            if (fixer.setLocale) {
                fixer.setLocale(this.settings.locale);
            }
        });
    }

    /**
     * Met à jour les paramètres et reconfigure les fixers
     */
    public updateSettings(settings: TypographySettings): void {
        this.settings = settings;
        
        this.fixers.forEach(fixer => {
            // Mettre à jour l'état d'activation
            if (fixer.id in settings.fixers) {
                fixer.enabled = settings.fixers[fixer.id];
            }
            
            // Mettre à jour la locale
            if (fixer.setLocale) {
                fixer.setLocale(settings.locale);
            }
        });
    }

    /**
     * Retourne tous les fixers triés par priorité
     */
    public getFixers(): TypographicFixer[] {
        return Array.from(this.fixers.values())
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Retourne uniquement les fixers activés
     */
    public getEnabledFixers(): TypographicFixer[] {
        return this.getFixers().filter(fixer => fixer.enabled);
    }

    /**
     * Retourne les fixers par catégorie
     */
    public getFixersByCategory(category: string): TypographicFixer[] {
        return this.getFixers().filter(fixer => fixer.category === category);
    }

    /**
     * Obtient un fixer spécifique par son ID
     */
    public getFixer(id: string): TypographicFixer | undefined {
        return this.fixers.get(id);
    }

    /**
     * Traite un texte avec tous les fixers activés
     */
    public processText(text: string): string {
        const enabledFixers = this.getEnabledFixers();
        
        return enabledFixers.reduce((currentText, fixer) => {
            try {
                return fixer.fix(currentText);
            } catch (error) {
                console.warn(`[TypographyEngine] Erreur dans le fixer ${fixer.id}:`, error);
                return currentText; // Retourner le texte non modifié en cas d'erreur
            }
        }, text);
    }

    /**
     * Traite un texte et retourne des informations détaillées sur les corrections
     */
    public processTextWithDetails(text: string): CorrectionResult {
        const original = text;
        const enabledFixers = this.getEnabledFixers();
        const fixersUsed: string[] = [];
        let correctionsCount = 0;

        const corrected = enabledFixers.reduce((currentText, fixer) => {
            try {
                const fixedText = fixer.fix(currentText);
                if (fixedText !== currentText) {
                    fixersUsed.push(fixer.id);
                    correctionsCount++;
                }
                return fixedText;
            } catch (error) {
                console.warn(`[TypographyEngine] Erreur dans le fixer ${fixer.id}:`, error);
                return currentText;
            }
        }, text);

        return {
            original,
            corrected,
            correctionsCount,
            fixersUsed
        };
    }

    /**
     * Gère les événements clavier en temps réel
     */
    public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (!this.settings.enableRealTimeCorrection) {
            return false;
        }

        const enabledFixers = this.getEnabledFixers();
        
        for (const fixer of enabledFixers) {
            if (fixer.handleKeyEvent) {
                try {
                    if (fixer.handleKeyEvent(event, editor)) {
                        return true; // Un fixer a traité l'événement
                    }
                } catch (error) {
                    console.warn(`[TypographyEngine] Erreur dans handleKeyEvent pour ${fixer.id}:`, error);
                }
            }
        }
        
        return false;
    }

    /**
     * Active ou désactive un fixer spécifique
     */
    public toggleFixer(fixerId: string, enabled: boolean): boolean {
        const fixer = this.fixers.get(fixerId);
        if (fixer) {
            fixer.enabled = enabled;
            this.settings.fixers[fixerId] = enabled;
            return true;
        }
        return false;
    }

    /**
     * Active ou désactive tous les fixers d'une catégorie
     */
    public toggleCategory(category: string, enabled: boolean): number {
        const categoryFixers = this.getFixersByCategory(category);
        
        categoryFixers.forEach(fixer => {
            fixer.enabled = enabled;
            this.settings.fixers[fixer.id] = enabled;
        });
        
        return categoryFixers.length;
    }

    /**
     * Réinitialise tous les fixers à leur état par défaut
     */
    public resetToDefaults(): void {
        this.fixers.forEach(fixer => {
            // Logique par défaut : certains fixers activés selon la langue
            const defaultEnabled = this.getDefaultEnabledState(fixer.id);
            fixer.enabled = defaultEnabled;
            this.settings.fixers[fixer.id] = defaultEnabled;
        });
    }

    /**
     * Détermine l'état par défaut d'un fixer selon la configuration
     */
    private getDefaultEnabledState(fixerId: string): boolean {
        const frenchEssentialFixers = ['ellipsis', 'dash', 'french-spacing', 'smart-quotes', 'comma'];
        const englishEssentialFixers = ['ellipsis', 'dash', 'smart-quotes', 'comma'];
        
        if (this.settings.locale.startsWith('fr')) {
            return frenchEssentialFixers.includes(fixerId);
        } else {
            return englishEssentialFixers.includes(fixerId);
        }
    }


}