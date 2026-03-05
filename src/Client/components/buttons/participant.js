const createChoiceButtonHandler = require('@utils/choiceButtonHandler');

module.exports = {
	customId: 'participant',
	execute: createChoiceButtonHandler(
		'Participant',
		'Vous êtes inscrit en tant que **Participant** !',
		'Vous êtes désinscrit.',
	),
};
