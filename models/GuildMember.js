module.exports = (sequelize, Sequelize) => {
	const Guild = sequelize.define('guild_members', {
		guild_id: {
			type: Sequelize.STRING,
			references:{
				model:'Guild',
				key:'guild_id',
			},
		},
		user_id: {
			type: Sequelize.STRING,
			references:{
				model:'User',
				key:'user_id',
			},
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
	});

	return Guild;
};