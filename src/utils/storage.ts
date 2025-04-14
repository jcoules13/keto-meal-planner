/**
 * Service de stockage local pour l'application
 */

// Préfixe pour éviter les collisions avec d'autres applications
const STORAGE_PREFIX = 'keto-meal-planner';

/**
 * Stocke une valeur dans le localStorage
 * @param key Clé de stockage
 * @param value Valeur à stocker (sera convertie en JSON)
 * @returns true si le stockage a réussi, false sinon
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const storageKey = `${STORAGE_PREFIX}-${key}`;
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(storageKey, jsonValue);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    
    // Gestion du dépassement de quota
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Espace de stockage insuffisant. Certaines fonctionnalités pourraient ne pas fonctionner correctement.');
    }
    
    return false;
  }
}

/**
 * Récupère une valeur du localStorage
 * @param key Clé de stockage
 * @param defaultValue Valeur par défaut si la clé n'existe pas
 * @returns La valeur stockée ou la valeur par défaut
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = `${STORAGE_PREFIX}-${key}`;
    const storedValue = localStorage.getItem(storageKey);
    
    if (storedValue === null) {
      return defaultValue;
    }
    
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error('Erreur lors du chargement depuis localStorage:', error);
    return defaultValue;
  }
}

/**
 * Supprime une valeur du localStorage
 * @param key Clé de stockage à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export function removeFromStorage(key: string): boolean {
  try {
    const storageKey = `${STORAGE_PREFIX}-${key}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression depuis localStorage:', error);
    return false;
  }
}

/**
 * Vérifie si une clé existe dans le localStorage
 * @param key Clé à vérifier
 * @returns true si la clé existe, false sinon
 */
export function existsInStorage(key: string): boolean {
  const storageKey = `${STORAGE_PREFIX}-${key}`;
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Efface toutes les données de l'application du localStorage
 * @returns true si l'opération a réussi, false sinon
 */
export function clearAllAppStorage(): boolean {
  try {
    // Ne supprime que les éléments avec notre préfixe
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    return false;
  }
}

/**
 * Vérifie si le localStorage est disponible
 * @returns true si le localStorage est disponible, false sinon
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}-test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}