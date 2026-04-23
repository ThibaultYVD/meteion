module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('event_images', {
			image_id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			image_data: {
				type: Sequelize.BLOB('medium'),
				allowNull: false,
			},
			image_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			image_type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		await queryInterface.addColumn('events', 'event_image_id', {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('events', 'event_image_id');
		await queryInterface.dropTable('event_images');
	},
};
