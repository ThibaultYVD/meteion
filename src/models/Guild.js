module.exports = (sequelize, Sequelize) => {
	const Guild = sequelize.define('guilds', {
		guild_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		guild_name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		guild_total_members: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		added_date: {
			type: Sequelize.DATE,
			allowNull: false,
		},
	}, {
	});

	return Guild;
};