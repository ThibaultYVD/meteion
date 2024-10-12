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
db.Event = require('./Event.js')(sequelize, Sequelize);
db.Choice = require('./Choice.js')(sequelize, Sequelize);
db.UserEventChoice = require('./UserEventChoice.js')(sequelize, Sequelize);

// INFO: Relations Guild et Settings
db.Guild.belongsToMany(db.Setting, {
	through: 'guild_settings', foreignKey: 'guild_id',
	onDelete: 'CASCADE',
});

db.Setting.belongsToMany(db.Guild, {
	through: 'guild_settings', foreignKey: 'setting_id',
	onDelete: 'CASCADE',
});

// INFO: Relations User et Guild (via GuildMember)
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


// INFO: Relations User et Event (via UserEventChoice)
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


// INFO: Relations UserEventChoice et Choice
db.UserEventChoice.belongsTo(db.Choice, {
	foreignKey: 'choice_id',
	onDelete: 'CASCADE',
});

db.Choice.hasMany(db.UserEventChoice, {
	foreignKey: 'choice_id',
	onDelete: 'CASCADE',
});

// INFO: Relations UserEventChoice et User
db.UserEventChoice.belongsTo(db.User, {
	foreignKey: 'user_id',
	onDelete: 'CASCADE',
});

db.UserEventChoice.belongsTo(db.Event, {
	foreignKey: 'event_id',
	onDelete: 'CASCADE',
});

async function insertDefaultChoices() {
	try {
	  await db.Choice.bulkCreate([
			{ choice_id: 1, choice_name: 'Participant' },
			{ choice_id: 2, choice_name: 'Indécis' },
			{ choice_id: 3, choice_name: 'Réserviste' },
	  ], {
			ignoreDuplicates: true,
	  });

	  console.log('Valeurs de base insérées dans la table Choice.');
	}
	catch (error) {
	  console.error('Erreur lors de l\'insertion des valeurs de base dans Choice:', error);
	}
}

insertDefaultChoices();

// Synchroniser les tables dans le bon ordre
async function syncTables() {
	try {
		await db.Event.sync({ force: true });
		await db.Choice.sync({ force: true });
		await db.User.sync({ force: true });

		// Créer la table pivot après que les tables de base sont prêtes
		await db.UserEventChoice.sync({ force: true });

		// Synchroniser Guild, GuildMember et Setting ensuite
		await db.Guild.sync({ force: true });
		await db.GuildMember.sync({ force: true });
		await db.Setting.sync({ force: true });

		console.log('Tables synchronisées avec succès');
	}
	catch (error) {
		console.error('Erreur lors de la synchronisation des tables :', error);
	}
}

syncTables();


module.exports = db;