'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('guilds', 'last_interaction', {
			type: Sequelize.DATE,
			allowNull: true,
		});
		await queryInterface.renameColumn('guilds', 'added_date', 'added_at');
		await queryInterface.renameColumn('users', 'added_date', 'added_at');
		await queryInterface.addColumn('events', 'edited_at', {
			type: Sequelize.DATE,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('guilds', 'last_interaction');
	},
};
