module.exports = (sequelize, Sequelize) => {
	const GuildMember = sequelize.define('guild_members', {
		guild_id: {
			type: Sequelize.STRING,
			primaryKey:true,
		},
		user_id: {
			type: Sequelize.STRING,
			primaryKey:true,
		},
		user_nickname: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		last_bot_interaction: {
			type: Sequelize.DATE,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});

	return GuildMember;
};
