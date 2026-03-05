const createChoiceButtonHandler = require('@utils/choiceButtonHandler');

module.exports = {
	customId: 'absent',
	execute: createChoiceButtonHandler(
		'Absent',
		'Vous êtes noté(e) en tant qu\'**Absent** !',
		'Vous n\'êtes plus noté en tant qu\'Absent.',
	),
};
