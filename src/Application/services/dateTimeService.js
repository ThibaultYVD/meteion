class DateTimeService {
	async getCurrentDate() {
		const currentDate = new Date();
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();
		return `${day}/${month}/${year}`;
	}

	async getCurrentHour() {
		const currentTime = new Date();
		const hours = currentTime.getHours() + 1;
		return `${String(hours).padStart(2, '0')}h00`;
	}
}

module.exports = new DateTimeService();