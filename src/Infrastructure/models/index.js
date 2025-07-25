const config = require('../config/db.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
	config.DB,
	config.USER,
	config.PASSWORD,
	{
		host: config.HOST,
		dialect: config.dialect,
		pool: {
			max: config.pool.max,
			min: config.pool.min,
			acquire: config.pool.acquire,
			idle: config.pool.idle,
		},
		define: {
			timestamps: false,
		},
	},
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Guild = require('./Guild.js')(sequelize, Sequelize);
db.Setting = require('./Setting.js')(sequelize, Sequelize);
db.User = require('./User.js')(sequelize, Sequelize);
db.GuildMember = require('./GuildMember.js')(sequelize, Sequelize);
db.GuildSetting = require('./GuildSetting.js')(sequelize, Sequelize);
db.Event = require('./Event.js')(sequelize, Sequelize);
db.Choice = require('./Choice.js')(sequelize, Sequelize);
db.UserEventChoice = require('./UserEventChoice.js')(sequelize, Sequelize);

// ===================== RELATIONS ===================== //

// User <-> Guild (via GuildMember)
db.User.belongsToMany(db.Guild, {
	through: db.GuildMember,
	foreignKey: 'user_id',
	onDelete: 'CASCADE',
});
db.Guild.belongsToMany(db.User, {
	through: db.GuildMember,
	foreignKey: 'guild_id',
	onDelete: 'CASCADE',
});

// GuildSetting -> Setting
db.GuildSetting.belongsTo(db.Setting, {
	as: 'Setting',
	foreignKey: 'setting_id',
	onDelete: 'CASCADE',
});
db.Setting.hasMany(db.GuildSetting, {
	foreignKey: 'setting_id',
	onDelete: 'CASCADE',
});

// User <-> Event (via UserEventChoice)
db.User.belongsToMany(db.Event, {
	through: db.UserEventChoice,
	foreignKey: 'user_id',
	onDelete: 'CASCADE',
});
db.Event.belongsToMany(db.User, {
	through: db.UserEventChoice,
	foreignKey: 'event_id',
	onDelete: 'CASCADE',
});

// UserEventChoice -> Choice
db.UserEventChoice.belongsTo(db.Choice, {
	foreignKey: 'choice_id',
	onDelete: 'CASCADE',
});
db.Choice.hasMany(db.UserEventChoice, {
	foreignKey: 'choice_id',
	onDelete: 'CASCADE',
});

// UserEventChoice -> User, Event
db.UserEventChoice.belongsTo(db.User, {
	foreignKey: 'user_id',
	onDelete: 'CASCADE',
});
db.UserEventChoice.belongsTo(db.Event, {
	foreignKey: 'event_id',
	onDelete: 'CASCADE',
});

// ===================== INSERTIONS INITIALES ===================== //

async function insertDefaultChoices() {
	try {
		await db.Choice.bulkCreate([
			{ choice_id: 1, choice_name: 'Participant' },
			{ choice_id: 2, choice_name: 'Indécis' },
			{ choice_id: 3, choice_name: 'Réserviste' },
			{ choice_id: 4, choice_name: 'Absent' },
		], { ignoreDuplicates: true });

		console.log('Valeurs de base insérées dans la table Choice.');
	}
	catch (error) {
		console.error('Erreur lors de l\'insertion des valeurs de base dans Choice:', error);
	}
}

async function insertSettings() {
	try {
		await db.Setting.bulkCreate([
			{
				setting_id: 1,
				setting_name: 'auto_close_event',
				setting_display_name: 'Suppression automatique des événements',
				activated_by_default: 'TRUE',
			},
			{
				setting_id: 2,
				setting_name: 'event_reminder',
				setting_display_name: 'Envoie d\'un message de rappel',
				activated_by_default: 'TRUE',
			},
		], { ignoreDuplicates: true });

		console.log('Valeurs de base insérées dans la table Setting.');
	}
	catch (error) {
		console.error('Erreur lors de l\'insertion des valeurs de base dans Setting:', error);
	}
}

insertDefaultChoices();
insertSettings();

module.exports = db;
