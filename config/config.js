require('dotenv').config();

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
		dialectOptions: {
			ssl: false,
		},
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