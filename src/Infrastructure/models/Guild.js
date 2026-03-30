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
		added_at: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		last_interaction: {
			type: Sequelize.DATE,
			allowNull: true,
		},
	}, {
	});

	return Guild;
};