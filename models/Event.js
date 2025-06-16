module.exports = (sequelize, Sequelize) => {
	const Event = sequelize.define('events', {
		event_id:{
			type: Sequelize.STRING,
			primaryKey: true,
			allowNull: false,
		},
		guild_id: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		channel_id:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		user_id: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_title:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_description:{
			type: Sequelize.TEXT,
			allowNull: false,
		},
		event_date_string:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_hour_string:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_date_hour_timestamp:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_status:{
			type: Sequelize.STRING,
			allowNull: false,
		},
		event_place:{
			type: Sequelize.STRING,
			allowNull: true,
		},
		remember_message_id:{
			type: Sequelize.STRING,
			allowNull: true,
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
		},

	}, {
	});

	return Event;
};