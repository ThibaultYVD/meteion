module.exports = (sequelize, Sequelize) => {
	const UserEventChoice = sequelize.define('user_event_choices', {
		user_id: {
			type: Sequelize.STRING,
			primaryKey: true,

		},
		event_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		choice_id: {
			type: Sequelize.INTEGER,
		},
		added_at:{
			type: Sequelize.DATE,
			allowNull:false,
		},
	}, {
		timestamps: false,
	});
	return UserEventChoice;
};
