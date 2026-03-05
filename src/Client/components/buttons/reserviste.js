const createChoiceButtonHandler = require('@utils/choiceButtonHandler');

module.exports = {
	customId: 'reserviste',
	execute: createChoiceButtonHandler(
		'Réserviste',
		'Vous êtes inscrit en tant que **Réserve** !',
		'Vous êtes désinscrit.',
	),
};
