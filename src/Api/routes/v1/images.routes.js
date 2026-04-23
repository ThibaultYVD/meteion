const { _eventImageRepository } = require('@repositories');

module.exports = async function imageRoutes(app) {
	app.get('/:imageId', async (request, reply) => {
		const image = await _eventImageRepository.findById(request.params.imageId);
		if (!image) {
			return reply.code(404).send({ error: 'Not Found', message: 'Image introuvable.', status: 404 });
		}
		return reply
			.header('Content-Type', image.image_type)
			.header('Cache-Control', 'public, max-age=31536000')
			.header('ngrok-skip-browser-warning', 'true')
			.send(image.image_data);
	});
};
