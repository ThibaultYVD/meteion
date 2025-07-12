const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

i18next.use(Backend).init({
	lng: 'fr',
	fallbackLng: 'en',
	backend: {
		loadPath: './locales/{{lng}}/translation.json',
	},
});

module.exports = i18next;
