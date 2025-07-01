// src/settings/settings-tab.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import { TypographicFixer } from '../types/interfaces';
import { PRESET_CONFIGURATIONS, PRESET_NAMES } from './default-settings';
import TypographyPlugin from '../main';

/**
 * Interface de configuration du plugin Typography Fixers
 */
export class TypographySettingTab extends PluginSettingTab {
    plugin: TypographyPlugin;

    constructor(app: App, plugin: TypographyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Titre principal
        containerEl.createEl('h2', { text: 'Paramètres Typography Fixers' });

        // Description
        containerEl.createEl('p', { 
            text: 'Plugin de correction typographique modulaire pour Obsidian. Corrige automatiquement les erreurs typographiques courantes selon les règles françaises et anglaises.',
            cls: 'setting-item-description'
        });

        // Section: Configuration générale
        this.createGeneralSettings(containerEl);

        // Section: Préconfigurations
        this.createPresetSettings(containerEl);

        // Section: Règles de correction
        this.createFixerSettings(containerEl);


        // Section: Actions
        this.createActionsSection(containerEl);

        // Ajouter les styles CSS personnalisés
        this.addCustomStyles(containerEl);
    }

    /**
     * Crée la section de configuration générale
     */
    private createGeneralSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h3', { text: 'Configuration générale' });

        // Correction en temps réel
        new Setting(containerEl)
            .setName('Correction en temps réel')
            .setDesc('Active la correction automatique pendant la frappe')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRealTimeCorrection)
                .onChange(async (value) => {
                    this.plugin.settings.enableRealTimeCorrection = value;
                    await this.plugin.saveSettings();
                })
            );

        // Langue
        new Setting(containerEl)
            .setName('Langue')
            .setDesc('Langue pour les règles typographiques')
            .addDropdown(dropdown => dropdown
                .addOption('fr-FR', 'Français (France)')
                .addOption('fr-CA', 'Français (Canada)')
                .addOption('en-US', 'Anglais (États-Unis)')
                .addOption('en-GB', 'Anglais (Royaume-Uni)')
                .setValue(this.plugin.settings.locale)
                .onChange(async (value) => {
                    this.plugin.settings.locale = value;
                    await this.plugin.saveSettings();
                    // Redessiner l'interface pour mettre à jour les exemples
                    this.display();
                })
            );
    }

    /**
     * Crée la section des préconfigurations
     */
    private createPresetSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h3', { text: 'Préconfigurations' });
        
        const presetDesc = containerEl.createEl('p', {
            text: 'Chargez rapidement une configuration optimisée pour votre usage.',
            cls: 'setting-item-description'
        });

        // Boutons de préconfigurations
        const presetContainer = containerEl.createDiv({ cls: 'typography-preset-container' });
        
        Object.entries(PRESET_CONFIGURATIONS).forEach(([key, config]) => {
            const button = presetContainer.createEl('button', {
                text: PRESET_NAMES[key as keyof typeof PRESET_NAMES],
                cls: 'mod-cta'
            });
            
            button.addEventListener('click', async () => {
                // Appliquer la préconfiguration
                this.plugin.settings = { ...config };
                await this.plugin.saveSettings();
                
                // Redessiner l'interface
                this.display();
                
                // Notification
                new (window as any).Notice(`Configuration "${PRESET_NAMES[key as keyof typeof PRESET_NAMES]}" appliquée`);
            });
        });
    }

    /**
     * Crée la section des fixers par catégorie
     */
    private createFixerSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h3', { text: 'Règles de correction' });
        containerEl.createEl('p', { 
            text: 'Activez ou désactivez les règles typographiques selon vos besoins.',
            cls: 'setting-item-description'
        });

        // Grouper les fixers par catégorie
        const fixersByCategory = this.plugin.engine.getFixers().reduce((acc, fixer) => {
            if (!acc[fixer.category]) acc[fixer.category] = [];
            acc[fixer.category].push(fixer);
            return acc;
        }, {} as Record<string, TypographicFixer[]>);

        const categoryNames = {
            punctuation: 'Ponctuation',
            spacing: 'Espacement',
            symbols: 'Symboles',
            quotes: 'Guillemets'
        };

        // Créer les paramètres pour chaque catégorie
        Object.entries(fixersByCategory).forEach(([category, fixers]) => {
            // Titre de catégorie avec contrôle global
            const categoryHeader = containerEl.createEl('h4', { 
                text: categoryNames[category as keyof typeof categoryNames] || category,
                cls: 'typography-category-header'
            });

            // Bouton pour activer/désactiver toute la catégorie
            const toggleAllButton = categoryHeader.createEl('button', {
                text: 'Tout basculer',
                cls: 'typography-toggle-category'
            });

            toggleAllButton.addEventListener('click', async () => {
                const allEnabled = fixers.every(f => f.enabled);
                const newState = !allEnabled;
                
                fixers.forEach(fixer => {
                    this.plugin.settings.fixers[fixer.id] = newState;
                });
                
                await this.plugin.saveSettings();
                this.display();
            });

            // Paramètres individuels des fixers
            fixers.forEach(fixer => {
                const setting = new Setting(containerEl)
                    .setName(fixer.name)
                    .setDesc(fixer.description)
                    .addToggle(toggle => toggle
                        .setValue(fixer.enabled)
                        .onChange(async (value) => {
                            this.plugin.settings.fixers[fixer.id] = value;
                            await this.plugin.saveSettings();
                        })
                    );

                // Ajouter un exemple si disponible
                if (fixer.getExample) {
                    const example = fixer.getExample();
                    const exampleEl = setting.descEl.createDiv({ cls: 'typography-example' });
                    
                    exampleEl.createDiv({ cls: 'typography-example-before' })
                        .innerHTML = `<span class="typography-example-label">Avant :</span> <code>${example.before}</code>`;
                    
                    exampleEl.createDiv({ cls: 'typography-example-after' })
                        .innerHTML = `<span class="typography-example-label">Après :</span> <code>${example.after}</code>`;
                }
            });
        });
    }

 

    /**
     * Crée la section des actions
     */
    private createActionsSection(containerEl: HTMLElement): void {
        containerEl.createEl('h3', { text: 'Actions' });

        // Bouton de test
        new Setting(containerEl)
            .setName('Tester les corrections')
            .setDesc('Teste les règles actives sur un texte d\'exemple')
            .addButton(button => button
                .setButtonText('Tester')
                .onClick(() => {
                    this.showTestModal();
                })
            );

        // Bouton de réinitialisation
        new Setting(containerEl)
            .setName('Réinitialiser la configuration')
            .setDesc('Remet tous les paramètres à leur valeur par défaut')
            .addButton(button => button
                .setButtonText('Réinitialiser')
                .setWarning()
                .onClick(async () => {
                    this.plugin.engine.resetToDefaults();
                    await this.plugin.saveSettings();
                    this.display();
                    new (window as any).Notice('Configuration réinitialisée');
                })
            );
    }

    /**
     * Crée une carte de statistique
     */
    private createStatCard(container: HTMLElement, label: string, value: string): void {
        const card = container.createDiv({ cls: 'typography-stat-card' });
        card.createEl('span', { text: value, cls: 'typography-stat-number' });
        card.createEl('span', { text: label, cls: 'typography-stat-label' });
    }

    /**
     * Affiche une modal de test des corrections
     */
    private showTestModal(): void {
        const testText = `Voici un test... avec des "guillemets", des espaces avant ! Et des tirets -- pour voir.`;
        const corrected = this.plugin.engine.processText(testText);
        
        const modal = new (window as any).Modal(this.app);
        modal.setTitle('Test des corrections');
        
        const content = modal.contentEl;
        content.createEl('h4', { text: 'Texte original :' });
        content.createEl('pre', { text: testText, cls: 'typography-test-original' });
        
        content.createEl('h4', { text: 'Texte corrigé :' });
        content.createEl('pre', { text: corrected, cls: 'typography-test-corrected' });
        
        modal.open();
    }

    /**
     * Ajoute les styles CSS personnalisés
     */
    private addCustomStyles(containerEl: HTMLElement): void {
        if (!containerEl.querySelector('.typography-custom-styles')) {
            const style = containerEl.createEl('style', { cls: 'typography-custom-styles' });
            style.textContent = `
                .typography-preset-container {
                    display: flex;
                    gap: 8px;
                    margin: 12px 0;
                    flex-wrap: wrap;
                }
                
                .typography-preset-container button {
                    padding: 8px 16px;
                    border-radius: 4px;
                }
                
                .typography-category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--background-modifier-border);
                }
                
                .typography-toggle-category {
                    font-size: 0.8em;
                    padding: 4px 8px;
                }
                

                
                .typography-stat-card {
                    background: var(--background-secondary);
                    padding: 12px;
                    border-radius: 6px;
                    text-align: center;
                    border: 1px solid var(--background-modifier-border);
                }
                
                .typography-stat-number {
                    font-size: 1.5em;
                    font-weight: 600;
                    color: var(--color-accent);
                    display: block;
                }
                
                .typography-stat-label {
                    font-size: 0.8em;
                    color: var(--text-muted);
                    margin-top: 4px;
                    display: block;
                }
                
                .typography-test-original,
                .typography-test-corrected {
                    background: var(--background-secondary);
                    padding: 12px;
                    border-radius: 4px;
                    margin: 8px 0;
                }
            `;
        }
    }
}