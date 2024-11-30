module.exports = (sequelize, Sequelize) => {
	const GuildSetting = sequelize.define('guild_settings', {
		guild_id: {
			type: Sequelize.STRING,
			primaryKey:true,
		},
		setting_id: {
			type: Sequelize.STRING,
			primaryKey:true,
		},
		activated: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});

	return GuildSetting;
};
