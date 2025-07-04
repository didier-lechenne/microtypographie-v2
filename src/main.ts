// src/main.ts - Plugin principal modulaire
import { App, Editor, MarkdownView, Plugin, Notice } from "obsidian";
import { createDecorations } from './ui/decorations';
import {
  createStatusBarButton,
  updateStatusBarButton,
  removeStatusBarButton,
  createTabTitleBarButton,
  updateTabTitleBarButton,
  removeTabTitleBarButton,
} from "./ui/statusBar";


// Import des types
import { TypographySettings } from "./types/interfaces";

// Import des modules
import { TypographyEngine } from "./engine/typography-engine";
import { TypographySettingTab } from "./settings/settings-tab";
import { validateSettings} from "./settings/default-settings";
import { UNICODE_CHARS } from "./constants/unicode";




/**
 * Plugin principal Typography Fixers
 * Correction typographique modulaire pour Obsidian
 */
export default class TypographyPlugin extends Plugin {
  // Utilisation de l'assertion d'assignation définitive (!)
  // Ces propriétés sont initialisées dans onload() avant toute utilisation
  settings!: TypographySettings;
  engine!: TypographyEngine;
  statusBarButton: HTMLElement | null = null;
  tabTitleBarButton: HTMLElement | null = null;
  decorationExtension: any = null;

  /**
   * Chargement du plugin
   */
async onload(): Promise<void> {
    console.log('🚀 Chargement du plugin Typography');

    try {
        // Charger les paramètres
        await this.loadSettings();

        // Initialiser le moteur typographique
        this.engine = new TypographyEngine(this.settings);

        // Créer et enregistrer les décorations (TOUJOURS actives pour générer les spans)
        this.decorationExtension = createDecorations(this.settings);
        this.registerEditorExtension(this.decorationExtension);

        // Appliquer l'état initial d'affichage via CSS
        this.updateInvisibleCharsDisplay();

        if (this.settings.highlightButton) {
            this.statusBarButton = createStatusBarButton(
                this, 
                this.settings.highlightEnabled,
                this.toggleHighlight.bind(this)
            );
        }


        if (this.settings.tabTitleBarButton) {
            this.tabTitleBarButton = createTabTitleBarButton(
                this,
                this.settings.highlightEnabled,
                () => this.toggleHighlight()
            );
        }

        // Ajouter les commandes
        this.addCommands();

        this.registerEditorMenuItems();

        // Gestionnaire d'événements clavier
        this.registerKeyboardHandlers();

        // Interface de paramètres
        this.addSettingTab(new TypographySettingTab(this.app, this));

        new Notice('Typography Fixers chargé avec succès!', 3000);

    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        new Notice('Erreur lors du chargement du plugin', 5000);
    }
}

  /**
   * Déchargement du plugin
   */
  onunload(): void {
    console.log("👋 Déchargement du plugin Typography Fixers");
    removeStatusBarButton(this.statusBarButton);
    removeTabTitleBarButton(this.tabTitleBarButton);
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
    
    // Mettre à jour le moteur
    if (this.engine) {
        this.engine.updateSettings(this.settings);
    }
    
    // Mettre à jour l'affichage CSS
    this.updateInvisibleCharsDisplay();
}

/**
 * Enregistre les éléments dans le menu contextuel avec préfixe "Insérer"
 */
private registerEditorMenuItems(): void {
    this.registerEvent(
        this.app.workspace.on('editor-menu', (menu, editor, view) => {
            // Ajouter une section "Insérer" avec nos éléments
            menu.addSeparator();
            
            // Titre de section (non cliquable)
            menu.addItem((item) => {
                item
                    .setTitle("— Insérer caractères typographiques —")
                    .setIcon("type")
                    .setDisabled(true);
            });

            // Espaces spéciaux
            menu.addItem((item) => {
                item
                    .setTitle("Insérer : Espace insécable")
                    .setIcon("space")
                    .onClick(() => {
                        this.insertSpecialChar(editor, UNICODE_CHARS.NO_BREAK_SPACE);
                    });
            });

            menu.addItem((item) => {
                item
                    .setTitle("Insérer : Espace fine insécable")
                    .setIcon("minus")
                    .onClick(() => {
                        this.insertSpecialChar(editor, UNICODE_CHARS.NO_BREAK_THIN_SPACE);
                    });
            });

            // Guillemets
            menu.addItem((item) => {
                item
                    .setTitle('Insérer : Guillemet ouvrant (“)')
                    .setIcon("quote-glyph")
                    .onClick(() => {
                        this.insertSpecialChar(editor, UNICODE_CHARS.LDQUO);
                    });
            });

            menu.addItem((item) => {
                item
                    .setTitle('Insérer : Guillemet fermant (”)')
                    .setIcon("quote-glyph")
                    .onClick(() => {
                        this.insertSpecialChar(editor, UNICODE_CHARS.RDQUO);
                    });
            });

            // Guillemets français si activés
            if (this.settings.guillemetsEnabled && this.settings.locale.startsWith('fr')) {
                menu.addItem((item) => {
                    item
                        .setTitle('Insérer : Guillemet français « ')
                        .setIcon("quote-glyph")
                        .onClick(() => {
                            this.insertSpecialChar(editor, 
                                `${UNICODE_CHARS.LAQUO}${UNICODE_CHARS.NO_BREAK_THIN_SPACE}`
                            );
                        });
                });

                menu.addItem((item) => {
                    item
                        .setTitle('Insérer : Guillemet français »')
                        .setIcon("quote-glyph")
                        .onClick(() => {
                            this.insertSpecialChar(editor, 
                                `${UNICODE_CHARS.NO_BREAK_THIN_SPACE}${UNICODE_CHARS.RAQUO}`
                            );
                        });
                });
            }
        })
    );
}


  /**
   * Ajoute les commandes du plugin
   */
  private addCommands(): void {
    // Commande: Corriger la sélection ou toute la note
    this.addCommand({
      id: "fix-selection",
      name: "Corriger la sélection",
      icon: "type",
      editorCallback: (editor: Editor) => {
        this.correctSelection(editor);
      },
    });

    // Commande: Corriger toute la note
    this.addCommand({
      id: "fix-entire-note",
      name: "Corriger toute la note",
      icon: "whole-word",
      editorCallback: (editor: Editor) => {
        this.correctEntireNote(editor);
      },
    });

    // Commande: Basculer la correction en temps réel
    this.addCommand({
      id: "toggle-realtime",
      name: "Basculer correction temps réel",
      icon: "zap",
      callback: async () => {
        await this.toggleRealTimeCorrection();
      },
    });

    this.addCommand({
      id: "toggle-highlight",
      name: "Afficher/Masquer les caractères invisibles",
      callback: () => {
        this.toggleHighlight();
      },
    });

    // Commande: Insérer espace insécable
    this.addCommand({
      id: "insert-non-breaking-space",
      name: "Insérer espace insécable",
      icon: "space",
      editorCallback: (editor: Editor) => {
        this.insertSpecialSpace(editor, UNICODE_CHARS.NO_BREAK_SPACE);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: " " // Ctrl+Shift+Espace
        }
      ]
    });

    // Commande: Insérer espace fine insécable
    this.addCommand({
      id: "insert-thin-non-breaking-space", 
      name: "Insérer espace fine insécable",
      icon: "minus",
      editorCallback: (editor: Editor) => {
        this.insertSpecialSpace(editor, UNICODE_CHARS.NO_BREAK_THIN_SPACE);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Alt", "Shift"],
          key: " " // Ctrl+Alt+Espace
        }
      ]
    });

    // Commande: Insérer guillemet ouvrant anglais
    this.addCommand({
      id: "insert-left-double-quote",
      name: "Insérer guillemet ouvrant anglais (“)",
      icon: "quote-glyph",
      editorCallback: (editor: Editor) => {
        this.insertSpecialChar(editor, UNICODE_CHARS.LDQUO);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "7" // Ctrl+Shift+[
        }
      ]
    });

    // Commande: Insérer guillemet fermant anglais
    this.addCommand({
      id: "insert-right-double-quote",
      name: "Insérer guillemet fermant anglais (”)",
      icon: "quote-glyph",
      editorCallback: (editor: Editor) => {
        this.insertSpecialChar(editor, UNICODE_CHARS.RDQUO);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "8" // Ctrl+Shift+]
        }
      ]
    });



  }

  /**
   * Insère un caractère spécial à la position du curseur
   */
  private insertSpecialChar(editor: Editor, character: string): void {
      const cursor = editor.getCursor();
      editor.replaceRange(character, cursor);
      // Déplacer le curseur après le caractère inséré
      editor.setCursor({
          line: cursor.line,
          ch: cursor.ch + 1
      });
  }

  /**
   * Insère un caractère d'espace spécial à la position du curseur
   */
  private insertSpecialSpace(editor: Editor, spaceChar: string): void {
      const cursor = editor.getCursor();
      editor.replaceRange(spaceChar, cursor);
      // Déplacer le curseur après le caractère inséré
      editor.setCursor({
          line: cursor.line,
          ch: cursor.ch + 1
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
    } else {
      new Notice("Aucune correction nécessaire", 2000);
    }
  }

  /**
   * Bascule la correction en temps réel
   */
  private async toggleRealTimeCorrection(): Promise<void> {
    this.settings.enableRealTimeCorrection =
      !this.settings.enableRealTimeCorrection;
    await this.saveSettings();

    const status = this.settings.enableRealTimeCorrection
      ? "activée"
      : "désactivée";
    new Notice(`Correction temps réel ${status}`, 3000);
  }

  /**
   * Affiche une notification de correction
   */
  private showCorrectionNotice(
    correctionsCount: number,
    fixersUsed: string[]
  ): void {
    if (correctionsCount === 0) {
      new Notice("Aucune correction appliquée", 2000);
      return;
    }

    const message =
      correctionsCount === 1
        ? "1 correction appliquée"
        : `${correctionsCount} corrections appliquées`;

    new Notice(message, 3000);
  }

  /**
   * Enregistre les gestionnaires d'événements clavier
   */
  private registerKeyboardHandlers(): void {
    this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });
  }

  /**
   * Gère les événements clavier pour la correction temps réel
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Vérifier qu'on est dans un éditeur Markdown
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView || activeView.getMode() !== "source") {
      return;
    }

    const editor = activeView.editor;

    // Déléguer au moteur typographique
    if (this.engine.handleKeyEvent(event, editor)) {
      event.preventDefault();
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
    return this.engine.getFixers().map((f) => f.id);
  }

/**
 * Met à jour l'affichage des caractères invisibles via CSS
 */
private updateInvisibleCharsDisplay(): void {
    if (this.settings.highlightEnabled) {
        document.body.addClass('typography-show-invisible');
    } else {
        document.body.removeClass('typography-show-invisible');
    }
}

/**
 * Bascule l'affichage des caractères invisibles
 */
private async toggleHighlight(): Promise<void> {
    this.settings.highlightEnabled = !this.settings.highlightEnabled;
    
    // Mise à jour immédiate de l'affichage
    this.updateInvisibleCharsDisplay();
    
    await this.saveSettings();
    
    const status = this.settings.highlightEnabled ? 'activé' : 'désactivé';
    new Notice(`Affichage des caractères invisibles ${status}`, 3000);
    
    // Mettre à jour les boutons
    updateStatusBarButton(this.statusBarButton, this.settings.highlightEnabled);
    updateTabTitleBarButton(this.tabTitleBarButton, this.settings.highlightEnabled);
}

}
