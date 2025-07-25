class DateTimeService {
	/**
	  * Récupère la date actuelle au format JJ/MM/AAAA.
	  * @returns {<string>} La date formatée.
	  */
	getCurrentDate() {
		const currentDate = new Date();
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();
		return `${day}/${month}/${year}`;
	}

	/**
	  * Récupère l'heure actuelle au format 00h00.
	  * @returns {<string>} L'heure formatée.
	  */
	getCurrentHour() {
		const currentTime = new Date();
		const hours = currentTime.getHours() + 1;
		return `${String(hours).padStart(2, '0')}h00`;
	}

	/**
	 *
	 * @param {*} date Une date
	 * @param {*} hour Une heure
	 * @returns true si la date est formaté tel dd/mm/yyy et l'heure tel 00h00
	*/
	isValidDateTime(date, hour) {
		const isValidDate = /^\d{2}\/\d{2}\/\d{4}$/.test(date);
		const isValidHour = /^\d{2}h\d{2}$/.test(hour);
		return isValidDate && isValidHour;
	}

	/**
	 *
	 * @param {*} date Une date sous le format dd/mm/yyyy
	 * @returns Un format de date en yyyy-mm-dd
	 */
	formatEventDate(date) {
		const [day, month, year] = date.split('/');
		return `${year}-${month}-${day}`;
	}

	/**
	 *
	 * @param {*} hour Une heure sous le format 00h00
	 * @returns Un format d'heure en 00:00
	 */
	formatEventHour(hour) {
		return hour.replace('h', ':');
	}
}

module.exports = DateTimeService;