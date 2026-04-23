module.exports = (sequelize, Sequelize) => {
	const EventImage = sequelize.define('event_images', {
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
	}, {
		timestamps: false,
	});

	return EventImage;
};
