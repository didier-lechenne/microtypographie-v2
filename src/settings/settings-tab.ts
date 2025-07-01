// src/settings/settings-tab.ts
import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { TypographicFixer } from '../types/interfaces';
import { LOCALE_CONFIGURATIONS, LOCALE_NAMES, CATEGORY_NAMES } from './default-settings';
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
            text: 'Plugin de correction typographique basé sur JoliTypo. Corrige automatiquement les erreurs typographiques selon les règles françaises, anglaises et allemandes.',
            cls: 'setting-item-description'
        });

        // Section: Configuration générale
        this.createGeneralSettings(containerEl);

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

        // Langue typographique
        new Setting(containerEl)
            .setName('Langue typographique')
            .setDesc('Choisissez les règles typographiques à appliquer. Change automatiquement les fixers recommandés.')
            .addDropdown(dropdown => {
                // Ajouter toutes les locales disponibles
                Object.entries(LOCALE_NAMES).forEach(([locale, name]) => {
                    dropdown.addOption(locale, name);
                });
                
                return dropdown
                    .setValue(this.plugin.settings.locale)
                    .onChange(async (value) => {
                        this.plugin.settings.locale = value;
                        this.updateFixersForLocale(value);
                        await this.plugin.saveSettings();
                        // Note: this.display() sera appelé dans updateFixersForLocale()
                    });
            });

        // Information sur les fixers actifs
        const activeFixersCount = Object.values(this.plugin.settings.fixers).filter(Boolean).length;
        const totalFixersCount = Object.keys(this.plugin.settings.fixers).length;
        
        containerEl.createEl('p', {
            text: `${activeFixersCount}/${totalFixersCount} règles activées pour ${LOCALE_NAMES[this.plugin.settings.locale]}`,
            cls: 'setting-item-description'
        });
    }

    /**
     * Crée la section des fixers par catégorie
     */
    private createFixerSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h3', { text: 'Règles de correction' });
        containerEl.createEl('p', { 
            text: 'Activez ou désactivez les règles typographiques selon vos besoins. Les règles recommandées pour votre langue sont activées automatiquement.',
            cls: 'setting-item-description'
        });

        // Grouper les fixers par catégorie
        const fixersByCategory = this.plugin.engine.getFixers().reduce((acc, fixer) => {
            if (!acc[fixer.category]) acc[fixer.category] = [];
            acc[fixer.category].push(fixer);
            return acc;
        }, {} as Record<string, TypographicFixer[]>);

        // Créer les paramètres pour chaque catégorie
        Object.entries(fixersByCategory).forEach(([category, fixers]) => {
            // Titre de catégorie avec contrôle global
            const categoryHeader = containerEl.createEl('h4', { 
                text: CATEGORY_NAMES[category] || category,
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

                // Ajouter un badge si c'est recommandé pour la locale actuelle
                const isRecommended = this.isFixerRecommendedForCurrentLocale(fixer.id);
                if (isRecommended) {
                    const badge = setting.nameEl.createEl('span', {
                        text: 'Recommandé',
                        cls: 'typography-recommended-badge'
                    });
                }

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

        
        // Section: Actions (simplifiée)
        new Setting(containerEl)
            .setName('Restaurer la configuration recommandée')
            .setDesc(`Active les fixers recommandés pour ${LOCALE_NAMES[this.plugin.settings.locale]}`)
            .addButton(button => button
                .setButtonText('Restaurer')
                .onClick(async () => {
                    this.updateFixersForLocale(this.plugin.settings.locale);
                    await this.plugin.saveSettings();
                    new Notice('Configuration restaurée');
                })
            );

    }

    /**
     * Met à jour les fixers actifs selon la locale choisie
     */
    private updateFixersForLocale(locale: string): void {
        const activeFixers = LOCALE_CONFIGURATIONS[locale];
        if (activeFixers) {
            // Désactiver tous les fixers d'abord
            Object.keys(this.plugin.settings.fixers).forEach((fixerId: string) => {
                this.plugin.settings.fixers[fixerId] = false;
            });
            
            // Activer les fixers recommandés pour cette locale
            activeFixers.forEach((fixerId: string) => {
                this.plugin.settings.fixers[fixerId] = true;
            });
            
            // Redessiner l'interface pour refléter les changements
            this.display();
        }
    }

    /**
     * Vérifie si un fixer est recommandé pour la locale actuelle
     */
    private isFixerRecommendedForCurrentLocale(fixerId: string): boolean {
        const recommendedFixers = LOCALE_CONFIGURATIONS[this.plugin.settings.locale];
        return recommendedFixers ? recommendedFixers.includes(fixerId) : false;
    }

    /**
     * Affiche une modal de test des corrections
     */
    private showTestModal(): void {
        const testText = `Voici un test... avec des "guillemets", des espaces avant ! Et des tirets -- pour voir. I'm testing (c) 2025.`;
        const corrected = this.plugin.engine.processText(testText);
        
        const modal = new (window as any).Modal(this.app);
        modal.setTitle('Test des corrections');
        
        const content = modal.contentEl;
        
        content.createEl('h4', { text: 'Texte original :' });
        content.createEl('pre', { text: testText, cls: 'typography-test-original' });
        
        content.createEl('h4', { text: 'Texte corrigé :' });
        content.createEl('pre', { text: corrected, cls: 'typography-test-corrected' });
        
        if (testText === corrected) {
            content.createEl('p', { 
                text: '⚠️ Aucune correction appliquée. Vérifiez que les fixers sont activés.',
                cls: 'typography-no-changes'
            });
        }
        
        modal.open();
    }

    /**
     * Ajoute les styles CSS personnalisés
     */
    private addCustomStyles(containerEl: HTMLElement): void {
        if (!containerEl.querySelector('.typography-custom-styles')) {
            const style = containerEl.createEl('style', { cls: 'typography-custom-styles' });
            style.textContent = `
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
                    border-radius: 4px;
                }
                
                .typography-recommended-badge {
                    display: inline-block;
                    background: var(--color-accent);
                    color: var(--text-on-accent);
                    font-size: 0.7em;
                    padding: 2px 6px;
                    border-radius: 10px;
                    margin-left: 8px;
                    font-weight: 500;
                }
                
                .typography-example {
                    margin-top: 12px;
                    padding: 12px;
                    background: var(--background-primary);
                    border: 1px solid var(--background-modifier-border);
                    border-radius: 6px;
                    font-size: 0.85em;
                    line-height: 1.4;
                }
                
                .typography-example-label {
                    font-weight: 600;
                    color: var(--text-accent);
                    margin-right: 6px;
                }
                
                .typography-example code {
                    background: var(--background-modifier-form-field);
                    color: var(--text-normal);
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-family: var(--font-monospace);
                    font-size: 0.9em;
                    border: 1px solid var(--background-modifier-border-hover);
                }
                
                .typography-example-before {
                    margin-bottom: 6px;
                }
                
                .typography-example-after {
                    margin-top: 6px;
                }
                
                .typography-test-original,
                .typography-test-corrected {
                    background: var(--background-secondary);
                    padding: 12px;
                    border-radius: 4px;
                    margin: 8px 0;
                    font-family: var(--font-monospace);
                    font-size: 0.9em;
                    white-space: pre-wrap;
                }
                
                .typography-no-changes {
                    color: var(--text-warning);
                    font-style: italic;
                    margin-top: 12px;
                }
            `;
        }
    }
}