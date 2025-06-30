// src/main.ts - Plugin principal modulaire
import { 
    App, 
    Editor, 
    MarkdownView, 
    Plugin, 
    Notice
} from 'obsidian';

// Import des types
import { TypographySettings } from './types/interfaces';

// Import des modules
import { TypographyEngine } from './engine/typography-engine';
import { TypographySettingTab } from './settings/settings-tab';
import { DEFAULT_SETTINGS, validateSettings } from './settings/default-settings';

/**
 * Plugin principal Typography Fixers
 * Correction typographique modulaire pour Obsidian
 */
export default class TypographyPlugin extends Plugin {
    // Utilisation de l'assertion d'assignation définitive (!)
    // Ces propriétés sont initialisées dans onload() avant toute utilisation
    settings!: TypographySettings;
    engine!: TypographyEngine;

    /**
     * Chargement du plugin
     */
    async onload(): Promise<void> {
        console.log('🚀 Chargement du plugin Typography Fixers v2');

        try {
            // Charger les paramètres
            await this.loadSettings();

            // Initialiser le moteur typographique
            this.engine = new TypographyEngine(this.settings);

            // Ajouter les commandes
            this.addCommands();

            // Gestionnaire d'événements clavier pour la correction temps réel
            this.registerKeyboardHandlers();

            // Interface de paramètres
            this.addSettingTab(new TypographySettingTab(this.app, this));

            // Message de confirmation
            new Notice('Typography Fixers chargé avec succès!', 3000);

        } catch (error) {
            console.error('❌ Erreur lors du chargement du plugin Typography Fixers:', error);
            new Notice('Erreur lors du chargement du plugin Typography Fixers', 5000);
        }
    }

    /**
     * Déchargement du plugin
     */
    onunload(): void {
        console.log('👋 Déchargement du plugin Typography Fixers');
    }

    /**
     * Charge les paramètres depuis le stockage
     */
    async loadSettings(): Promise<void> {
        const loadedData = await this.loadData();
        this.settings = validateSettings(loadedData || {});
    }

    /**
     * Sauvegarde les paramètres
     */
    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        
        // Mettre à jour le moteur avec les nouveaux paramètres
        if (this.engine) {
            this.engine.updateSettings(this.settings);
        }
    }

    /**
     * Ajoute les commandes du plugin
     */
    private addCommands(): void {
        // Commande: Corriger la sélection ou toute la note
        this.addCommand({
            id: 'fix-selection',
            name: 'Corriger la sélection',
            icon: 'type',
            editorCallback: (editor: Editor) => {
                this.correctSelection(editor);
            }
        });

        // Commande: Corriger toute la note
        this.addCommand({
            id: 'fix-entire-note',
            name: 'Corriger toute la note',
            icon: 'whole-word',
            editorCallback: (editor: Editor) => {
                this.correctEntireNote(editor);
            }
        });

        // Commande: Basculer la correction en temps réel
        this.addCommand({
            id: 'toggle-realtime',
            name: 'Basculer correction temps réel',
            icon: 'zap',
            callback: async () => {
                await this.toggleRealTimeCorrection();
            }
        });

        // Commande: Afficher les statistiques
        this.addCommand({
            id: 'show-stats',
            name: 'Afficher les statistiques',
            icon: 'bar-chart',
            callback: () => {
                this.showStats();
            }
        });
    }

    /**
     * Corrige la sélection ou toute la note si rien n'est sélectionné
     */
    private correctSelection(editor: Editor): void {
        const selection = editor.getSelection();
        
        if (selection) {
            // Corriger la sélection
            const result = this.engine.processTextWithDetails(selection);
            editor.replaceSelection(result.corrected);
            
            this.showCorrectionNotice(result.correctionsCount, result.fixersUsed);
            this.updateStats(result.correctionsCount, result.fixersUsed);
        } else {
            // Aucune sélection, corriger toute la note
            this.correctEntireNote(editor);
        }
    }

    /**
     * Corrige toute la note
     */
    private correctEntireNote(editor: Editor): void {
        const content = editor.getValue();
        const result = this.engine.processTextWithDetails(content);
        
        if (result.corrected !== content) {
            editor.setValue(result.corrected);
            this.showCorrectionNotice(result.correctionsCount, result.fixersUsed);
            this.updateStats(result.correctionsCount, result.fixersUsed);
        } else {
            new Notice('Aucune correction nécessaire', 2000);
        }
    }

    /**
     * Bascule la correction en temps réel
     */
    private async toggleRealTimeCorrection(): Promise<void> {
        this.settings.enableRealTimeCorrection = !this.settings.enableRealTimeCorrection;
        await this.saveSettings();
        
        const status = this.settings.enableRealTimeCorrection ? 'activée' : 'désactivée';
        new Notice(`Correction temps réel ${status}`, 3000);
    }

    /**
     * Affiche les statistiques
     */
    private showStats(): void {
        const stats = this.engine.getStats();
        const userStats = this.settings.stats;
        
        let message = `📊 Statistiques Typography Fixers\n\n`;
        message += `• Fixers actifs: ${stats.enabledFixers}/${stats.totalFixers}\n`;
        
        if (userStats) {
            message += `• Corrections totales: ${userStats.totalCorrections}\n`;
            
            if (userStats.lastUsed) {
                const lastUsed = new Date(userStats.lastUsed).toLocaleDateString();
                message += `• Dernière utilisation: ${lastUsed}\n`;
            }
        }
        
        new Notice(message, 8000);
    }

    /**
     * Met à jour les statistiques d'utilisation
     */
    private updateStats(correctionsCount: number, fixersUsed: string[]): void {
        if (!this.settings.stats) {
            this.settings.stats = {
                totalCorrections: 0,
                correctionsByFixer: {},
                lastUsed: Date.now()
            };
        }

        // Mettre à jour les statistiques
        this.settings.stats.totalCorrections += correctionsCount;
        this.settings.stats.lastUsed = Date.now();

        // Compter les corrections par fixer
        fixersUsed.forEach(fixerId => {
            this.settings.stats!.correctionsByFixer[fixerId] = 
                (this.settings.stats!.correctionsByFixer[fixerId] || 0) + 1;
        });

        // Sauvegarder en arrière-plan
        this.saveSettings();
    }

    /**
     * Affiche une notification de correction
     */
    private showCorrectionNotice(correctionsCount: number, fixersUsed: string[]): void {
        if (correctionsCount === 0) {
            new Notice('Aucune correction appliquée', 2000);
            return;
        }

        const message = correctionsCount === 1 
            ? '1 correction appliquée'
            : `${correctionsCount} corrections appliquées`;
            
        new Notice(message, 3000);
    }

    /**
     * Enregistre les gestionnaires d'événements clavier
     */
    private registerKeyboardHandlers(): void {
        this.registerDomEvent(document, 'keydown', (event: KeyboardEvent) => {
            this.handleKeyDown(event);
        });
    }

    /**
     * Gère les événements clavier pour la correction temps réel
     */
    private handleKeyDown(event: KeyboardEvent): void {
        // Vérifier qu'on est dans un éditeur Markdown
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'source') {
            return;
        }

        const editor = activeView.editor;
        
        // Déléguer au moteur typographique
        if (this.engine.handleKeyEvent(event, editor)) {
            event.preventDefault();
            
            // Mettre à jour les statistiques pour les corrections temps réel
            this.updateStats(1, ['real-time']);
        }
    }

    /**
     * API publique pour les autres plugins (optionnel)
     */
    public getEngine(): TypographyEngine {
        return this.engine;
    }

    public async applyCorrections(text: string): Promise<string> {
        return this.engine.processText(text);
    }

    public getAvailableFixers(): string[] {
        return this.engine.getFixers().map(f => f.id);
    }
}