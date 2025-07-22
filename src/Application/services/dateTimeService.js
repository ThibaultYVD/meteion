class DateTimeService {
	/**
	  * Récupère la date actuelle au format JJ/MM/AAAA.
	  * @returns {Promise<string>} La date formatée.
	  */
	async getCurrentDate() {
		const currentDate = new Date();
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();
		return `${day}/${month}/${year}`;
	}

	/**
	  * Récupère l'heure actuelle au format 00h00.
	  * @returns {Promise<string>} L'heure formatée.
	  */
	async getCurrentHour() {
		const currentTime = new Date();
		const hours = currentTime.getHours() + 1;
		return `${String(hours).padStart(2, '0')}h00`;
	}
}

module.exports = DateTimeService;