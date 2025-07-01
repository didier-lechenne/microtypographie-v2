import { Plugin, setIcon } from "obsidian";


/**
 * Crée un bouton dans la barre d'état
 * @param plugin Instance du plugin
 * @param isEnabled État initial (activé/désactivé)
 * @param toggleCallback Fonction de rappel pour le basculement
 * @returns Élément HTML du bouton
 */
export function createStatusBarButton(
    plugin: Plugin,
    isEnabled: boolean,
    toggleCallback: () => void
): HTMLElement {
    const statusBarItemEl = plugin.addStatusBarItem();
    statusBarItemEl.id = "highlight-status-bar-button";
    
    statusBarItemEl.addClass("mod-clickable");
    
    // Créer l'icône et l'ajouter au bouton
    setIcon(statusBarItemEl, "pilcrow");

    statusBarItemEl.setAttribute("aria-label", "Afficher/Masquer les caractères invisibles");
    statusBarItemEl.setAttribute("data-tooltip-position", "top");

    // Définir l'apparence initiale
    updateStatusBarButton(statusBarItemEl, isEnabled);

    // Ajouter l'événement de clic
    statusBarItemEl.onClickEvent(() => {
        toggleCallback();
    });
    
    return statusBarItemEl;
}



/**
 * Met à jour l'apparence du bouton de la barre d'état
 * @param buttonEl Élément HTML du bouton
 * @param isEnabled État (activé/désactivé)
 */
export function updateStatusBarButton(buttonEl: HTMLElement | null, isEnabled: boolean): void {
    if (!buttonEl) return;
    
    if (isEnabled) {
        buttonEl.addClass('highlight-enabled');
    } else {
        buttonEl.removeClass('highlight-enabled');
    }
}



/**
 * Supprime le bouton de la barre d'état
 * @param buttonEl Élément HTML du bouton
 */
export function removeStatusBarButton(buttonEl: HTMLElement | null): void {
    if (buttonEl) {
        buttonEl.remove();
    }
}

