const config = require('../../config/db.js');

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


db.Guild.belongsToMany(db.Setting, {
	through: 'guild_settings', foreignKey: 'guild_id',
	onDelete: 'CASCADE',
});

db.Setting.belongsToMany(db.Guild, {
	through: 'guild_settings', foreignKey: 'setting_id',
	onDelete: 'CASCADE',
});

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

module.exports = db;