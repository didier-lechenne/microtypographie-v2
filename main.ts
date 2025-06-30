// main.ts - Plugin principal
import { 
    App, 
    Editor, 
    MarkdownView, 
    Plugin, 
    PluginSettingTab, 
    Setting,
    KeyboardEvent,
    EditorChange,
    TFile
} from 'obsidian';

// ==================================================
// INTERFACES ET TYPES
// ==================================================

interface TypographicFixer {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    category: 'punctuation' | 'spacing' | 'symbols' | 'quotes';
    
    // Transformation du texte (mode batch)
    fix(text: string): string;
    
    // Gestion des événements clavier (mode temps réel)
    handleKeyEvent?(event: KeyboardEvent, editor: Editor): boolean;
    
    // Preview pour les paramètres
    getExample?(): { before: string; after: string };
}

interface TypographySettings {
    enableRealTimeCorrection: boolean;
    fixers: Record<string, boolean>;
    locale: string;
}

// ==================================================
// CONSTANTES UNICODE
// ==================================================

const UNICODE_CHARS = {
    NO_BREAK_THIN_SPACE: '\u202F',  // espace fine insécable
    NO_BREAK_SPACE: '\u00A0',       // espace insécable
    ELLIPSIS: '…',                  // ellipse
    NDASH: '–',                     // tiret demi-cadratin
    MDASH: '—',                     // tiret cadratin
    TIMES: '×',                     // symbole fois
    LDQUO: '"',                     // guillemet ouvrant
    RDQUO: '"',                     // guillemet fermant
    LSQUO: ''',                     // apostrophe ouvrante
    RSQUO: ''',                     // apostrophe fermante
    LAQUO: '«',                     // guillemet français ouvrant
    RAQUO: '»',                     // guillemet français fermant
    TRADE: '™',                     // trademark
    REG: '®',                       // registered
    COPY: '©',                      // copyright
} as const;

// ==================================================
// IMPLÉMENTATIONS DES FIXERS
// ==================================================

class EllipsisFixer implements TypographicFixer {
    id = 'ellipsis';
    name = 'Points de suspension';
    description = 'Remplace ... par …';
    enabled = true;
    priority = 1;
    category: 'punctuation' = 'punctuation';

    fix(text: string): string {
        return text.replace(/\.{3,}/g, UNICODE_CHARS.ELLIPSIS);
    }

    handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (event.key === '.' && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Vérifier si on a déjà deux points
            if (beforeCursor.endsWith('..')) {
                // Remplacer les trois points par une ellipse
                const newLine = line.substring(0, cursor.ch - 2) + UNICODE_CHARS.ELLIPSIS + line.substring(cursor.ch);
                editor.setLine(cursor.line, newLine);
                editor.setCursor({ line: cursor.line, ch: cursor.ch - 1 });
                return true; // Empêcher l'insertion du troisième point
            }
        }
        return false;
    }

    getExample() {
        return { before: 'En fait...', after: `En fait${UNICODE_CHARS.ELLIPSIS}` };
    }
}

class DashFixer implements TypographicFixer {
    id = 'dash';
    name = 'Tirets typographiques';
    description = 'Convertit -- en — et améliore les tirets entre nombres';
    enabled = true;
    priority = 2;
    category: 'punctuation' = 'punctuation';

    fix(text: string): string {
        return text
            // Double tiret vers tiret cadratin
            .replace(/--/g, UNICODE_CHARS.MDASH)
            // Tiret entre nombres (dates, plages)
            .replace(/(\d+)\s*-\s*(\d+)/g, `$1${UNICODE_CHARS.NDASH}$2`)
            // Espaces autour du tiret cadratin
            .replace(/\s*—\s*/g, ` ${UNICODE_CHARS.MDASH} `);
    }

    handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (event.key === '-' && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Double tiret
            if (beforeCursor.endsWith('-')) {
                const newLine = line.substring(0, cursor.ch - 1) + ` ${UNICODE_CHARS.MDASH} ` + line.substring(cursor.ch);
                editor.setLine(cursor.line, newLine);
                editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
                return true;
            }
        }
        return false;
    }

    getExample() {
        return { before: 'Période 2020-2024 -- important', after: `Période 2020${UNICODE_CHARS.NDASH}2024 ${UNICODE_CHARS.MDASH} important` };
    }
}

class FrenchSpacingFixer implements TypographicFixer {
    id = 'french-spacing';
    name = 'Espaces français';
    description = 'Ajoute des espaces insécables selon les règles françaises';
    enabled = false; // Désactivé par défaut
    priority = 3;
    category: 'spacing' = 'spacing';

    fix(text: string): string {
        return text
            // Espace fine insécable avant ; ! ? »
            .replace(/\s*([;!?»])/g, `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}$1`)
            // Espace insécable avant :
            .replace(/\s*(:)/g, `${UNICODE_CHARS.NO_BREAK_SPACE}$1`)
            // Espace insécable après «
            .replace(/(«)\s*/g, `$1${UNICODE_CHARS.NO_BREAK_SPACE}`)
            // Supprime l'espace avant les virgules
            .replace(/\s+,/g, ',')
            // Un seul espace après les virgules
            .replace(/,\s*/g, ', ');
    }

    handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (['!', '?', ';', ':'].includes(event.key) && !event.ctrlKey && !event.metaKey) {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const beforeCursor = line.substring(0, cursor.ch);
            
            // Enlever l'espace existant s'il y en a un
            const cleanBefore = beforeCursor.replace(/\s+$/, '');
            const spaceChar = event.key === ':' ? UNICODE_CHARS.NO_BREAK_SPACE : UNICODE_CHARS.NO_BREAK_THIN_SPACE;
            
            const newLine = cleanBefore + spaceChar + event.key + line.substring(cursor.ch);
            editor.setLine(cursor.line, newLine);
            editor.setCursor({ line: cursor.line, ch: cleanBefore.length + 2 });
            return true;
        }
        return false;
    }

    getExample() {
        return { before: 'Bonjour ! Comment allez-vous ?', after: `Bonjour${UNICODE_CHARS.NO_BREAK_THIN_SPACE}! Comment allez-vous${UNICODE_CHARS.NO_BREAK_THIN_SPACE}?` };
    }
}

class SmartQuotesFixer implements TypographicFixer {
    id = 'smart-quotes';
    name = 'Guillemets intelligents';
    description = 'Convertit les guillemets droits en guillemets typographiques';
    enabled = true;
    priority = 4;
    category: 'quotes' = 'quotes';

    private locale: string = 'en';

    setLocale(locale: string) {
        this.locale = locale;
    }

    fix(text: string): string {
        if (this.locale.startsWith('fr')) {
            return this.fixFrenchQuotes(text);
        } else {
            return this.fixEnglishQuotes(text);
        }
    }

    private fixFrenchQuotes(text: string): string {
        // Guillemets français « »
        let result = text;
        let inQuote = false;
        
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_SPACE}`;
            } else {
                inQuote = false;
                return `${UNICODE_CHARS.NO_BREAK_SPACE}${UNICODE_CHARS.RAQUO}`;
            }
        });
        
        // Apostrophes
        result = result.replace(/'/g, UNICODE_CHARS.RSQUO);
        
        return result;
    }

    private fixEnglishQuotes(text: string): string {
        let result = text;
        let inQuote = false;
        
        // Guillemets doubles
        result = result.replace(/"/g, () => {
            if (!inQuote) {
                inQuote = true;
                return UNICODE_CHARS.LDQUO;
            } else {
                inQuote = false;
                return UNICODE_CHARS.RDQUO;
            }
        });
        
        // Apostrophes (pas en début de mot = contraction)
        result = result.replace(/(\w)'/g, `$1${UNICODE_CHARS.RSQUO}`);
        
        return result;
    }

    getExample() {
        if (this.locale.startsWith('fr')) {
            return { before: 'Il a dit "Bonjour" et c\'est parti.', after: `Il a dit ${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_SPACE}Bonjour${UNICODE_CHARS.NO_BREAK_SPACE}${UNICODE_CHARS.RAQUO} et c${UNICODE_CHARS.RSQUO}est parti.` };
        } else {
            return { before: 'He said "Hello" and it\'s done.', after: `He said ${UNICODE_CHARS.LDQUO}Hello${UNICODE_CHARS.RDQUO} and it${UNICODE_CHARS.RSQUO}s done.` };
        }
    }
}

class MathSymbolsFixer implements TypographicFixer {
    id = 'math-symbols';
    name = 'Symboles mathématiques';
    description = 'Convertit x entre nombres en × et améliore d\'autres symboles';
    enabled = true;
    priority = 5;
    category: 'symbols' = 'symbols';

    fix(text: string): string {
        return text
            // x entre nombres devient ×
            .replace(/(\d+)\s*x\s*(\d+)/gi, `$1${UNICODE_CHARS.TIMES}$2`)
            // Symboles de marque
            .replace(/\(tm\)/gi, UNICODE_CHARS.TRADE)
            .replace(/\(r\)/gi, UNICODE_CHARS.REG)
            .replace(/\(c\)/gi, UNICODE_CHARS.COPY);
    }

    getExample() {
        return { before: 'Matrice 3 x 4 (c) 2024', after: `Matrice 3${UNICODE_CHARS.TIMES}4 ${UNICODE_CHARS.COPY} 2024` };
    }
}

class NoSpaceBeforeCommaFixer implements TypographicFixer {
    id = 'no-space-comma';
    name = 'Virgules sans espace';
    description = 'Supprime les espaces avant les virgules';
    enabled = true;
    priority = 6;
    category: 'spacing' = 'spacing';

    fix(text: string): string {
        return text
            .replace(/\s+,/g, ',')
            .replace(/,\s*/g, ', ');
    }

    getExample() {
        return { before: 'Pommes , poires,oranges', after: 'Pommes, poires, oranges' };
    }
}

// ==================================================
// MOTEUR TYPOGRAPHIQUE
// ==================================================

class TypographyEngine {
    private fixers: Map<string, TypographicFixer> = new Map();
    private settings: TypographySettings;

    constructor(settings: TypographySettings) {
        this.settings = settings;
        this.initializeFixers();
    }

    private initializeFixers() {
        const fixers = [
            new EllipsisFixer(),
            new DashFixer(),
            new FrenchSpacingFixer(),
            new SmartQuotesFixer(),
            new MathSymbolsFixer(),
            new NoSpaceBeforeCommaFixer()
        ];

        fixers.forEach(fixer => {
            this.fixers.set(fixer.id, fixer);
            
            // Appliquer les paramètres
            if (fixer.id in this.settings.fixers) {
                fixer.enabled = this.settings.fixers[fixer.id];
            }
            
            // Configurer la locale si applicable
            if ('setLocale' in fixer && typeof fixer.setLocale === 'function') {
                fixer.setLocale(this.settings.locale);
            }
        });
    }

    updateSettings(settings: TypographySettings) {
        this.settings = settings;
        this.fixers.forEach(fixer => {
            if (fixer.id in settings.fixers) {
                fixer.enabled = settings.fixers[fixer.id];
            }
            if ('setLocale' in fixer && typeof fixer.setLocale === 'function') {
                fixer.setLocale(settings.locale);
            }
        });
    }

    getFixers(): TypographicFixer[] {
        return Array.from(this.fixers.values()).sort((a, b) => a.priority - b.priority);
    }

    processText(text: string): string {
        return this.getEnabledFixers().reduce((result, fixer) => {
            return fixer.fix(result);
        }, text);
    }

    handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
        if (!this.settings.enableRealTimeCorrection) return false;

        for (const fixer of this.getEnabledFixers()) {
            if (fixer.handleKeyEvent && fixer.handleKeyEvent(event, editor)) {
                return true; // Un fixer a traité l'événement
            }
        }
        return false;
    }

    private getEnabledFixers(): TypographicFixer[] {
        return this.getFixers().filter(fixer => fixer.enabled);
    }
}

// ==================================================
// PLUGIN PRINCIPAL
// ==================================================

const DEFAULT_SETTINGS: TypographySettings = {
    enableRealTimeCorrection: true,
    locale: 'en-US',
    fixers: {
        'ellipsis': true,
        'dash': true,
        'french-spacing': false,
        'smart-quotes': true,
        'math-symbols': true,
        'no-space-comma': true
    }
};

export default class TypographyPlugin extends Plugin {
    settings: TypographySettings;
    engine: TypographyEngine;

    async onload() {
        console.log('Chargement du plugin Typography Fixers');

        // Charger les paramètres
        await this.loadSettings();

        // Initialiser le moteur
        this.engine = new TypographyEngine(this.settings);

        // Ajouter les commandes
        this.addCommands();

        // Gestionnaire d'événements clavier
        this.registerDomEvent(document, 'keydown', this.handleKeyDown.bind(this));

        // Onglet de paramètres
        this.addSettingTab(new TypographySettingTab(this.app, this));
    }

    onunload() {
        console.log('Déchargement du plugin Typography Fixers');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.engine.updateSettings(this.settings);
    }

    private addCommands() {
        // Commande pour corriger la sélection
        this.addCommand({
            id: 'fix-selection',
            name: 'Corriger la sélection',
            editorCallback: (editor: Editor) => {
                const selection = editor.getSelection();
                if (selection) {
                    const fixed = this.engine.processText(selection);
                    editor.replaceSelection(fixed);
                } else {
                    // Si pas de sélection, corriger toute la note
                    const content = editor.getValue();
                    const fixed = this.engine.processText(content);
                    editor.setValue(fixed);
                }
            }
        });

        // Commande pour corriger toute la note
        this.addCommand({
            id: 'fix-entire-note',
            name: 'Corriger toute la note',
            editorCallback: (editor: Editor) => {
                const content = editor.getValue();
                const fixed = this.engine.processText(content);
                editor.setValue(fixed);
            }
        });

        // Commande pour basculer la correction en temps réel
        this.addCommand({
            id: 'toggle-realtime',
            name: 'Basculer correction temps réel',
            callback: async () => {
                this.settings.enableRealTimeCorrection = !this.settings.enableRealTimeCorrection;
                await this.saveSettings();
            }
        });
    }

    private handleKeyDown(event: KeyboardEvent) {
        // Vérifier qu'on est dans un éditeur Markdown
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'source') return;

        const editor = activeView.editor;
        if (this.engine.handleKeyEvent(event, editor)) {
            event.preventDefault();
        }
    }
}

// ==================================================
// INTERFACE DE PARAMÈTRES
// ==================================================

class TypographySettingTab extends PluginSettingTab {
    plugin: TypographyPlugin;

    constructor(app: App, plugin: TypographyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Paramètres Typography Fixers' });

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

        // Locale
        new Setting(containerEl)
            .setName('Langue')
            .setDesc('Langue pour les règles typographiques')
            .addDropdown(dropdown => dropdown
                .addOption('en-US', 'Anglais (US)')
                .addOption('en-GB', 'Anglais (UK)')
                .addOption('fr-FR', 'Français (France)')
                .addOption('fr-CA', 'Français (Canada)')
                .setValue(this.plugin.settings.locale)
                .onChange(async (value) => {
                    this.plugin.settings.locale = value;
                    await this.plugin.saveSettings();
                })
            );

        // Section des fixers
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

        Object.entries(fixersByCategory).forEach(([category, fixers]) => {
            // Titre de catégorie
            containerEl.createEl('h4', { text: categoryNames[category as keyof typeof categoryNames] || category });

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
                    exampleEl.createSpan({ text: 'Avant : ', cls: 'typography-example-label' });
                    exampleEl.createEl('code', { text: example.before });
                    exampleEl.createEl('br');
                    exampleEl.createSpan({ text: 'Après : ', cls: 'typography-example-label' });
                    exampleEl.createEl('code', { text: example.after });
                }
            });
        });

        // Ajouter des styles CSS
        const style = containerEl.createEl('style');
        style.textContent = `
            .typography-example {
                margin-top: 8px;
                padding: 8px;
                background: var(--background-secondary);
                border-radius: 4px;
                font-size: 0.9em;
            }
            .typography-example-label {
                font-weight: 500;
            }
            .typography-example code {
                background: var(--background-primary);
                padding: 2px 4px;
                border-radius: 2px;
            }
        `;
    }
}