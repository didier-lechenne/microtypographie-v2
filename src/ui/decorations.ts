import { EditorView, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { TypographySettings } from '../types/interfaces';

// Variable globale simplifiée pour les settings
let currentSettings: TypographySettings;

/**
 * Crée les décorations visuelles pour les caractères spéciaux
 */
export function createDecorations(settings: TypographySettings) {
    currentSettings = settings;
    
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

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            // Mise à jour si le document change OU si la vue change
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        buildDecorations(view: EditorView) {
            const builder = new RangeSetBuilder<Decoration>();
            
            // Appliquer les décorations uniquement si la mise en évidence est activée
            if (currentSettings && currentSettings.highlightEnabled) {
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
 * Met à jour les settings globaux (fonction simplifiée)
 */
export function updateDecorationSettings(settings: TypographySettings) {
    currentSettings = settings;
}