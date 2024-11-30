module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('users', {
		user_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		username: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		global_name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		added_date: {
			type: Sequelize.DATE,
			allowNull: false,
		},
	}, {
	});

	return User;
};

