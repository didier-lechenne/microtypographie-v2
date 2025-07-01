import { EditorView, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { TypographySettings } from '../types/interfaces';

/**
 * Crée les décorations visuelles pour les caractères spéciaux
 * Les spans sont TOUJOURS générés, l'affichage est contrôlé par CSS
 */
export function createDecorations(settings: TypographySettings) {
    // Décorations (toujours actives pour générer les spans)
    const nonBreakingSpaceDecoration = Decoration.mark({
        class: 'nonBreakingSpace'
    });

    const thinSpaceDecoration = Decoration.mark({
        class: 'thinSpace'
    });

    const emDashDecoration = Decoration.mark({
        class: 'em-dash'
    });

    const regularSpaceDecoration = Decoration.mark({
        class: 'regularSpace'
    });

    return ViewPlugin.fromClass(class {
        decorations: any;

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        buildDecorations(view: EditorView) {
            const builder = new RangeSetBuilder<Decoration>();
            
            // TOUJOURS générer les spans (pas de condition sur highlightEnabled)
            for (let { from, to } of view.visibleRanges) {
                let text = view.state.doc.sliceString(from, to);
                
                let startPos = from;
                let inFrontmatter = false;
                let inCodeBlock = false;
                let lineStart = true;
                
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const pos = startPos + i;
                    
                    // Détection du frontmatter
                    if (lineStart && text.substr(i, 3) === '---') {
                        inFrontmatter = !inFrontmatter;
                        i += 2;
                        lineStart = false;
                        continue;
                    }
                    
                    // Détection des blocs de code
                    if (lineStart && text.substr(i, 3) === '```') {
                        inCodeBlock = !inCodeBlock;
                        i += 2;
                        lineStart = false;
                        continue;
                    }
                    
                    // Détection des nouvelles lignes
                    if (char === '\n') {
                        lineStart = true;
                    } else if (lineStart && char !== ' ' && char !== '\t') {
                        lineStart = false;
                    }
                    
                    const isInSpecialBlock = inFrontmatter || inCodeBlock;
                    
                    // Générer les spans TOUJOURS (sauf dans les blocs spéciaux)
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
            
            return builder.finish();
        }
    }, {
        decorations: v => v.decorations
    });
}