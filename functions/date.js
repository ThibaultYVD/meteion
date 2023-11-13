
/**
 * Obtient la date actuelle sous le format mm/dd/yyyy.
 * @returns {Date} La date actuelle .
 */
function getDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');

    return formattedToday = `${mm}/${dd}/${yyyy}`;
}

/**
 * Fait un formatage de la date renseigné dans le modal de création d'event.
 * @returns {Date} sous le format mm/dd/yyyy .
 */
function formatEventDate(date){
    const [day, month, year] = date.split('/');
    return `${month}/${day}/${year}`
}

/**
 * Fait un formatage de l'heure renseigné dans le modal de création d'event.
 * @returns {Date} sous le format mm/dd/yyyy .
 */
function formatEventHour(heure){
    const [hour, min] = heure.split('h')
    return `${hour}:${min}`
}
module.exports = { getDate, formatEventDate, formatEventHour }