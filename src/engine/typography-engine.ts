// src/engine/typography-engine.ts
import { Editor } from "obsidian";
import {
  TypographicFixer,
  TypographySettings,
  CorrectionResult,
} from "../types/interfaces";
import { createAllFixers } from "../fixers";

/**
 * Interface pour les zones protégées
 */
interface ProtectedZone {
  placeholder: string;
  originalContent: string;
  type:
    | "frontmatter"
    | "codeblock"
    | "wikilink"
    | "url"
    | "regex"
    | "shortcode";
}

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

    allFixers.forEach((fixer) => {
      this.fixers.set(fixer.id, fixer);

      if (fixer.id in this.settings.fixers) {
        fixer.enabled = this.settings.fixers[fixer.id];
      }

      if (fixer.setLocale) {
        fixer.setLocale(this.settings.locale);
      }

      if (fixer.setSettings) {
        fixer.setSettings(this.settings);
      }
    });
  }

  /**
   * Met à jour les paramètres et reconfigure les fixers
   */
  public updateSettings(settings: TypographySettings): void {
    this.settings = settings;

    this.fixers.forEach((fixer) => {
      // Mettre à jour l'état d'activation
      if (fixer.id in settings.fixers) {
        fixer.enabled = settings.fixers[fixer.id];
      }

      // Mettre à jour la locale
      if (fixer.setLocale) {
        fixer.setLocale(settings.locale);
      }

      if (fixer.setSettings) {
        fixer.setSettings(settings);
      }
    });
  }

  /**
   * Retourne tous les fixers triés par priorité
   */
  public getFixers(): TypographicFixer[] {
    return Array.from(this.fixers.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  /**
   * Retourne uniquement les fixers activés
   */
  public getEnabledFixers(): TypographicFixer[] {
    return this.getFixers().filter((fixer) => fixer.enabled);
  }

  /**
   * Retourne les fixers par catégorie
   */
  public getFixersByCategory(category: string): TypographicFixer[] {
    return this.getFixers().filter((fixer) => fixer.category === category);
  }

  /**
   * Obtient un fixer spécifique par son ID
   */
  public getFixer(id: string): TypographicFixer | undefined {
    return this.fixers.get(id);
  }

  /**
   * Traite un texte et retourne des informations détaillées sur les corrections
   */
  public processTextWithDetails(text: string): CorrectionResult {
    const original = text;
    const corrected = this.processText(text); // Utilise le masquage

    // Stats simplifiées car on ne peut plus tracker individuellement
    const correctionsCount = original !== corrected ? 1 : 0;
    const fixersUsed = correctionsCount > 0 ? ["multiple"] : [];

    return {
      original,
      corrected,
      correctionsCount,
      fixersUsed,
    };
  }

  /**
   * Gère les événements clavier en temps réel
   */
  public handleKeyEvent(event: KeyboardEvent, editor: Editor): boolean {
    if (!this.settings.enableRealTimeCorrection) {
      return false;
    }

    // Vérifier si le curseur est dans une zone protégée
    if (this.isCursorInProtectedZone(editor)) {
      return false;
    }

    const enabledFixers = this.getEnabledFixers();

    for (const fixer of enabledFixers) {
      if (fixer.handleKeyEvent) {
        try {
          if (fixer.handleKeyEvent(event, editor)) {
            return true;
          }
        } catch (error) {
          console.warn(
            `[TypographyEngine] Erreur dans handleKeyEvent pour ${fixer.id}:`,
            error
          );
        }
      }
    }

    return false;
  }

  /**
   * 🛡️ Vérifie si le curseur est dans une zone protégée
   */
  private isCursorInProtectedZone(editor: Editor): boolean {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const doc = editor.getValue();
    const lines = doc.split("\n");

    // 1. Vérifier frontmatter
    if (lines.length > 0 && lines[0].trim() === "---") {
      let frontmatterEnd = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          frontmatterEnd = i;
          break;
        }
      }
      if (frontmatterEnd !== -1 && cursor.line <= frontmatterEnd) {
        return true;
      }
    }

    // 2. Vérifier bloc de code
    const beforeCursor = doc.substring(0, editor.posToOffset(cursor));
    const afterCursor = doc.substring(editor.posToOffset(cursor));

    if (beforeCursor.includes("```") && afterCursor.includes("```")) {
      const beforeCount = (beforeCursor.match(/```/g) || []).length;
      const afterCount = (afterCursor.match(/```/g) || []).length;
      if (beforeCount % 2 === 1 && afterCount >= 1) {
        return true;
      }
    }

    // 3. Vérifier code inline, wikilinks, etc. sur la ligne courante
    const protectedPatterns = [
      /`[^`]*\|/, // Code inline incomplet
      /\[\[[^\]]*\|/, // WikiLink incomplet
      /https?:\/\/\S*/, // URL
      /\/[^\/]*\|/, // Regex incomplète
    ];

    const beforeLine = line.substring(0, cursor.ch);
    for (const pattern of protectedPatterns) {
      if (pattern.test(beforeLine)) {
        return true;
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

    categoryFixers.forEach((fixer) => {
      fixer.enabled = enabled;
      this.settings.fixers[fixer.id] = enabled;
    });

    return categoryFixers.length;
  }

  /**
   * Réinitialise tous les fixers à leur état par défaut
   */
  public resetToDefaults(): void {
    this.fixers.forEach((fixer) => {
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
    const frenchEssentialFixers = [
      "ellipsis",
      "dash",
      "french-spacing",
      "smart-quotes",
      "comma",
    ];
    const englishEssentialFixers = [
      "ellipsis",
      "dash",
      "smart-quotes",
      "comma",
    ];

    if (this.settings.locale.startsWith("fr")) {
      return frenchEssentialFixers.includes(fixerId);
    } else {
      return englishEssentialFixers.includes(fixerId);
    }
  }

  public processText(text: string): string {
    // 1. Masquer les zones protégées
    const { maskedText, protectedZones } = this.maskProtectedContent(text);

    // 2. Appliquer tous les fixers sur le texte masqué
    const processedText = this.processTextContent(maskedText);

    // 3. Restaurer les zones protégées
    return this.unmaskProtectedContent(processedText, protectedZones);
  }

  /**
   * Applique les fixers sur un texte
   */
  private processTextContent(text: string): string {
    const enabledFixers = this.getEnabledFixers();

    return enabledFixers.reduce((currentText, fixer) => {
      try {
        return fixer.fix(currentText);
      } catch (error) {
        console.warn(
          `[TypographyEngine] Erreur dans le fixer ${fixer.id}:`,
          error
        );
        return currentText;
      }
    }, text);
  }

  /**
   * les zones à protéger
   */
  private maskProtectedContent(text: string): {
  maskedText: string;
  protectedZones: ProtectedZone[];
} {
  const protectedZones: ProtectedZone[] = [];
  let maskedText = text;
  let placeholderCounter = 0;

  // Générateur de marqueurs uniques
  const generatePlaceholder = (type: string): string => {
    return `__TYPOGRAPHY_PROTECTED_${type.toUpperCase()}_${placeholderCounter++}__`;
  };

  // 1. Protéger le frontmatter YAML
  maskedText = maskedText.replace(
    /^---\s*\n([\s\S]*?)\n---\s*\n/m,
    (match) => {
      const placeholder = generatePlaceholder("frontmatter");
      protectedZones.push({
        placeholder,
        originalContent: match,
        type: "frontmatter",
      });
      return placeholder;
    }
  );

  // 2. Protéger les blocs de code
  maskedText = maskedText.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = generatePlaceholder("codeblock");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "codeblock",
    });
    return placeholder;
  });

  // 3. Protéger les shortcodes 11ty/Nunjucks AVEC traitement spécial pour caption
  maskedText = maskedText.replace(
    /{%\s+(\w+)\s+([\s\S]*?)\s+%}/g,
    (match: string, shortcodeName: string, shortcodeContent: string) => {
      let processedContent = shortcodeContent;
      
      // Traiter SEULEMENT les captions
      processedContent = processedContent.replace(
        /caption:\s*"([^"]*?)"/g,
        (_, captionText: string) => {
          const correctedCaption = this.processTextContent(captionText);
          return `caption: "${correctedCaption}"`;
        }
      );
      
      const correctedShortcode = `{% ${shortcodeName} ${processedContent} %}`;
      
      // GARDER la protection
      const placeholder = generatePlaceholder("shortcode");
      protectedZones.push({
        placeholder,
        originalContent: correctedShortcode,
        type: "shortcode"
      });
      return placeholder;
    }
  );

  // 3.5. Traiter les patterns (notes: "...") directement dans le texte
  maskedText = maskedText.replace(
    /\(notes?\s*:\s*"([\s\S]*?)"\s*\)/g,
    (match: string, notesText: string) => {
      // Appliquer les corrections typographiques directement avec les fixers
      const enabledFixers = this.getEnabledFixers();
      const correctedNotes = enabledFixers.reduce((text, fixer) => {
        try {
          return fixer.fix(text);
        } catch (error) {
          console.warn(`[TypographyEngine] Erreur dans le fixer ${fixer.id}:`, error);
          return text;
        }
      }, notesText);
      return `(notes: "${correctedNotes}")`;
    }
  );

  // 4. Protéger les WikiLinks
  maskedText = maskedText.replace(/\[\[([^\]]+)\]\]/g, (match) => {
    const placeholder = generatePlaceholder("wikilink");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "wikilink",
    });
    return placeholder;
  });

  // 5. Protéger les URLs
  maskedText = maskedText.replace(/https?:\/\/[^\s\])\}]+/g, (match) => {
    const placeholder = generatePlaceholder("url");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "url",
    });
    return placeholder;
  });

  // 6. Protéger les expressions régulières /pattern/flags
  maskedText = maskedText.replace(/\/[^\/\s]+\/[gimuy]*/g, (match) => {
    const placeholder = generatePlaceholder("regex");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "regex",
    });
    return placeholder;
  });

  // 7. Protéger le code inline `code`
  maskedText = maskedText.replace(/`[^`]+`/g, (match) => {
    const placeholder = generatePlaceholder("inlinecode");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "regex", // Réutilise le type regex
    });
    return placeholder;
  });

  // 8. Protéger les liens markdown [text](url)
  maskedText = maskedText.replace(/\[([^\]]*)\]\([^\)]+\)/g, (match) => {
    const placeholder = generatePlaceholder("mdlink");
    protectedZones.push({
      placeholder,
      originalContent: match,
      type: "url", // Réutilise le type url
    });
    return placeholder;
  });

  return { maskedText, protectedZones };
}

  /**
   * 🔓 Restaure le contenu original à la place des marqueurs
   */
  private unmaskProtectedContent(
    maskedText: string,
    protectedZones: ProtectedZone[]
  ): string {
    let restoredText = maskedText;

    // Restaurer chaque zone protégée
    protectedZones.forEach((zone) => {
      restoredText = restoredText.replace(
        zone.placeholder,
        zone.originalContent
      );
    });

    return restoredText;
  }
}
