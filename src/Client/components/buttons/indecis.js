const createChoiceButtonHandler = require('@utils/choiceButtonHandler');

module.exports = {
	customId: 'indecis',
	execute: createChoiceButtonHandler(
		'Indécis',
		'Vous êtes inscrit en tant qu\'**Indécis** !',
		'Vous êtes désinscrit.',
	),
};
