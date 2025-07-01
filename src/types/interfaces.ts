// src/types/interfaces.ts
import { Editor } from 'obsidian';

/**
 * Catégories de règles typographiques
 */
export type FixerCategory = 'punctuation' | 'spacing' | 'symbols' | 'quotes';

/**
 * Interface pour un correcteur typographique
 */
export interface TypographicFixer {
    /** Identifiant unique du fixer */
    id: string;
    
    /** Nom affiché dans l'interface */
    name: string;
    
    /** Description de la règle */
    description: string;
    
    /** État d'activation */
    enabled: boolean;
    
    /** Priorité d'exécution (plus bas = plus prioritaire) */
    priority: number;
    
    /** Catégorie de la règle */
    category: FixerCategory;
    
    /**
     * Applique les corrections au texte (mode batch)
     * @param text Texte à corriger
     * @returns Texte corrigé
     */
    fix(text: string): string;
    
    /**
     * Gère les événements clavier en temps réel (optionnel)
     * @param event Événement clavier
     * @param editor Instance de l'éditeur Obsidian
     * @returns true si l'événement a été traité
     */
    handleKeyEvent?(event: KeyboardEvent, editor: Editor): boolean;
    
    /**
     * Fournit un exemple avant/après pour l'interface (optionnel)
     * @returns Exemple de transformation
     */
    getExample?(): FixerExample;
    
    /**
     * Configure la locale du fixer (optionnel)
     * @param locale Code de langue (ex: 'fr-FR', 'en-US')
     */
    setLocale?(locale: string): void;
}

/**
 * Exemple de transformation pour l'interface utilisateur
 */
export interface FixerExample {
    /** Texte avant correction */
    before: string;
    
    /** Texte après correction */
    after: string;
}

/**
 * Configuration du plugin
 */
export interface TypographySettings {
    /** Active/désactive la correction en temps réel */
    enableRealTimeCorrection: boolean;
    
    /** Configuration individuelle des fixers */
    fixers: Record<string, boolean>;
    
    /** Langue pour les règles typographiques */
    locale: string;
    
    /** Active/désactive l'affichage des caractères invisibles */
    highlightEnabled: boolean;
    
}

/**
 * Configuration d'un fixer regroupée
 */
export interface FixerConfig {
    /** Instance du fixer */
    fixer: TypographicFixer;
    
    /** État d'activation */
    enabled: boolean;
}

/**
 * Résultat d'une correction
 */
export interface CorrectionResult {
    /** Texte original */
    original: string;
    
    /** Texte corrigé */
    corrected: string;
    
    /** Nombre de corrections appliquées */
    correctionsCount: number;
    
    /** Liste des fixers utilisés */
    fixersUsed: string[];
}