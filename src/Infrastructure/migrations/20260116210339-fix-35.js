'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn('events', 'event_description', {
			type: Sequelize.TEXT,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn('events', 'event_description', {
			type: Sequelize.TEXT,
			allowNull: false,
		});
	},
};