require('dotenv').config();

console.log('⚙️ Sequelize Config Loaded:');
console.log('STAGING_DB_USER:', process.env.STAGING_DB_USER);
console.log('STAGING_DB_PASSWORD:', process.env.STAGING_DB_PASSWORD);
console.log('STAGING_DB_NAME:', process.env.STAGING_DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);

module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'mysql',
		logging: false,
	},
	staging: {
		username: process.env.STAGING_DB_USER,
		password: process.env.STAGING_DB_PASSWORD,
		database: process.env.STAGING_DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'mysql',
		logging: false,
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'mysql',
		logging: false,
	},
};