module.exports = (sequelize, Sequelize) => {
	const Setting = sequelize.define('settings', {
		setting_id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		setting_name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		activated_by_default:{
			type: Sequelize.STRING,
			allowNull: false,
		},
	});

	return Setting;
};