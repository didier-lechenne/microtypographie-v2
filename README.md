# Typography Fixers Plugin pour Obsidian

Plugin de correction typographique modulaire inspiré de JoliTypo, offrant des corrections automatiques en temps réel et par commandes.

## ✨ Fonctionnalités

- **Architecture modulaire** : Chaque règle typographique est un "Fixer" indépendant
- **Correction temps réel** : Corrections automatiques pendant la frappe
- **Commandes manuelles** : Corriger la sélection ou toute la note
- **Paramètres configurables** : Activer/désactiver chaque règle individuellement
- **Support multilingue** : Règles adaptées selon la langue choisie

## 🔧 Fixers disponibles

### Ponctuation
- **Points de suspension** : `...` → `…`
- **Tirets typographiques** : `--` → `—`, amélioration des tirets entre nombres

### Espacement  
- **Espaces français** : Espaces insécables selon les règles françaises
- **Virgules** : Suppression des espaces avant les virgules

### Symboles
- **Symboles mathématiques** : `3 x 4` → `3×4`
- **Marques** : `(c)` → `©`, `(r)` → `®`, `(tm)` → `™`

### Guillemets
- **Guillemets intelligents** : `"texte"` → `"texte"` (EN) ou `«texte»` (FR)

## 🚀 Installation

1. Téléchargez les fichiers du plugin
2. Placez-les dans `.obsidian/plugins/typography-fixers/` 
3. Activez le plugin dans les paramètres d'Obsidian
4. Configurez les règles selon vos préférences

## ⌨️ Commandes

- **Corriger la sélection** : Applique les corrections au texte sélectionné
- **Corriger toute la note** : Applique les corrections à l'ensemble de la note
- **Basculer correction temps réel** : Active/désactive la correction automatique

## ⚙️ Configuration

Accédez aux paramètres du plugin pour :
- Activer/désactiver la correction en temps réel
- Choisir la langue (EN/FR)
- Configurer individuellement chaque règle
- Voir des exemples avant/après pour chaque Fixer