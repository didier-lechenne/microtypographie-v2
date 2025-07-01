import { EditorView, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { TypographySettings } from '../types/interfaces';



// Variable globale pour partager les settings
let globalSettings: TypographySettings;
let settingsVersion = 0; // Nouvelle variable pour forcer les mises à jour

/**
 * Crée les décorations visuelles pour les caractères spéciaux
 */
export function createDecorations(settings: TypographySettings) {
    globalSettings = settings;
    
    // Décoration pour l'espace insécable normale
    const nonBreakingSpaceDecoration = Decoration.mark({
        class: 'nonBreakingSpace'
    });

    // Décoration pour l'espace fine insécable
    const thinSpaceDecoration = Decoration.mark({
        class: 'thinSpace'
    });

    // Décoration pour le tiret cadratin
    const emDashDecoration = Decoration.mark({
        class: 'em-dash'
    });

    // Décoration pour l'espace normale
    const regularSpaceDecoration = Decoration.mark({
        class: 'regularSpace'
    });

    return ViewPlugin.fromClass(class {
        decorations: any;
        lastSettingsVersion: number = 0; // Tracker la version des settings

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
            this.lastSettingsVersion = settingsVersion;
        }

        update(update: ViewUpdate) {
            // Mise à jour si le document change OU si les settings ont changé
            if (update.docChanged || 
                update.viewportChanged || 
                this.lastSettingsVersion !== settingsVersion) {
                
                this.decorations = this.buildDecorations(update.view);
                this.lastSettingsVersion = settingsVersion;
            }
        }

        buildDecorations(view: EditorView) {
            const builder = new RangeSetBuilder<Decoration>();
            
            // Appliquer les décorations uniquement si la mise en évidence est activée
            if (globalSettings && globalSettings.highlightEnabled) {
                for (let { from, to } of view.visibleRanges) {
                    let text = view.state.doc.sliceString(from, to);
                    
                    // Position de départ pour le traitement du texte
                    let startPos = from;
                    
                    // Analyser le texte pour détecter les frontmatter et blocs de code
                    let inFrontmatter = false;
                    let inCodeBlock = false;
                    let lineStart = true;
                    
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const pos = startPos + i;
                        
                        // Détection du début et fin du frontmatter (---) 
                        if (lineStart && text.substr(i, 3) === '---') {
                            inFrontmatter = !inFrontmatter;
                            i += 2;
                            lineStart = false;
                            continue;
                        }
                        
                        // Détection du début et fin des blocs de code (```)
                        if (lineStart && text.substr(i, 3) === '```') {
                            inCodeBlock = !inCodeBlock;
                            i += 2;
                            lineStart = false;
                            continue;
                        }
                        
                        // Détection du début d'une nouvelle ligne
                        if (char === '\n') {
                            lineStart = true;
                        } else if (lineStart && char !== ' ' && char !== '\t') {
                            lineStart = false;
                        }
                        
                        // Vérifier si la ligne actuelle est dans un bloc spécial
                        const isInSpecialBlock = inFrontmatter || inCodeBlock;
                        
                        // Appliquer les décorations seulement si on n'est pas dans un bloc spécial
                        if (!isInSpecialBlock) {
                            if (char === '\u00A0') {
                                builder.add(pos, pos + 1, nonBreakingSpaceDecoration);
                            }
                            if (char === '\u202F') {
                                builder.add(pos, pos + 1, thinSpaceDecoration);
                            }
                            if (char === '—') {
                                builder.add(pos, pos + 1, emDashDecoration);
                            }
                            if (char === ' ') {
                                builder.add(pos, pos + 1, regularSpaceDecoration);
                            }
                        }
                    }
                }
            }
            
            return builder.finish();
        }
    }, {
        decorations: v => v.decorations
    });
}

/**
 * Met à jour les settings globaux et force la mise à jour
 */
/**
 * Met à jour les settings globaux et force la mise à jour
 */
export function updateDecorationSettings(settings: TypographySettings) {
    globalSettings = settings;
    settingsVersion++;
    
    // Méthode plus agressive : simuler un changement de viewport
    setTimeout(() => {
        const editors = document.querySelectorAll('.cm-editor');
        editors.forEach((editor: any) => {
            if (editor.cmView && editor.cmView.state) {
                try {
                    // Forcer un changement de viewport pour déclencher update()
                    const view = editor.cmView;
                    const currentViewport = view.viewport;
                    
                    // Déclencher artificiellement un changement de viewport
                    view.scrollDOM.dispatchEvent(new Event('scroll'));
                    view.requestMeasure();
                } catch (error) {
                    console.log('Erreur lors de la mise à jour:', error);
                }
            }
        });
    }, 10);
}