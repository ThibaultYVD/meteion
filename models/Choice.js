module.exports = (sequelize, Sequelize) => {
	const Choice = sequelize.define('choices', {
		choice_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		choice_name: {
			type: Sequelize.STRING,
			allowNull: false,
		},

	}, {
		timestamps: false,
	});

	return Choice;
};