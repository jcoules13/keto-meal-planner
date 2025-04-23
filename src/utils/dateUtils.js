/**
 * Utilitaires pour la gestion des dates dans les plans de repas
 */

/**
 * Génère les dates d'un plan hebdomadaire en fonction du jour de départ choisi
 * @param {number} startDayOfWeek - Jour de départ de la semaine (0 = dimanche, 1 = lundi, etc.)
 * @param {Date} referenceDate - Date de référence (par défaut: date actuelle)
 * @returns {Object} Dates de début et de fin formatées
 */
export const generatePlanDates = (startDayOfWeek = 1, referenceDate = null) => {
  // Utiliser la date actuelle comme référence si non spécifiée
  // Cela évite le problème de capture de la date lors de la définition de la fonction
  const today = referenceDate ? new Date(referenceDate) : new Date();
  
  // Trouver la date du prochain jour de départ spécifié
  const currentDayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
  
  // Calculer le nombre de jours à ajouter/soustraire
  // Si aujourd'hui est le jour demandé, on démarre aujourd'hui
  // Sinon, on calcule le nombre de jours jusqu'au prochain jour demandé
  let daysToAdd = 0;
  
  if (currentDayOfWeek !== startDayOfWeek) {
    // Calculer le nombre de jours jusqu'au prochain jour de départ
    daysToAdd = (startDayOfWeek - currentDayOfWeek + 7) % 7;
  }
  
  // Créer la date de début
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysToAdd);
  
  // Créer la date de fin (7 jours plus tard)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 6 jours pour couvrir une semaine complète
  
  // Formater les dates au format YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Formater les dates pour l'affichage (JJ/MM)
  const formatDisplayDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    displayStartDate: formatDisplayDate(startDate),
    displayEndDate: formatDisplayDate(endDate),
    displayName: `Plan du ${formatDisplayDate(startDate)} au ${formatDisplayDate(endDate)}`,
  };
};

/**
 * Récupère la préférence du jour de départ depuis le localStorage ou utilise la valeur par défaut
 * @param {number} defaultDay - Jour par défaut si aucune préférence n'est trouvée (1 = lundi)
 * @returns {number} Jour de départ (0-6)
 */
export const getPreferredStartDay = (defaultDay = 1) => {
  const saved = localStorage.getItem('keto-meal-planner-start-day');
  return saved !== null ? parseInt(saved, 10) : defaultDay;
};

/**
 * Sauvegarde la préférence du jour de départ dans le localStorage
 * @param {number} startDay - Jour de départ à sauvegarder (0-6)
 */
export const savePreferredStartDay = (startDay) => {
  localStorage.setItem('keto-meal-planner-start-day', startDay.toString());
};

/**
 * Obtient le nom du jour en français
 * @param {number} dayNumber - Numéro du jour (0-6)
 * @returns {string} Nom du jour en français
 */
export const getDayName = (dayNumber) => {
  const days = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];
  return days[dayNumber];
};

/**
 * Obtient le jour de la semaine à partir d'une date ISO
 * @param {string} dateStr - Date au format ISO (YYYY-MM-DD)
 * @returns {string} Jour de la semaine abrégé en français
 */
export const getDayOfWeek = (dateStr) => {
  const date = new Date(dateStr);
  const options = { weekday: 'short' };
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

/**
 * Formate une date ISO en format court français
 * @param {string} dateStr - Date au format ISO (YYYY-MM-DD)
 * @returns {string} Date au format JJ/MM
 */
export const formatShortDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
};

/**
 * Formate une date ISO en format long français
 * @param {string} dateStr - Date au format ISO (YYYY-MM-DD)
 * @returns {string} Date au format "jour J mois"
 */
export const formatLongDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
};
