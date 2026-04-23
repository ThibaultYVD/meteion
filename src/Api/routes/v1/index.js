// src/Api/routes/v1/index.js
const batchRoutes = require('./batchs.routes.js');
const imageRoutes = require('./images.routes.js');

module.exports = async function v1Routes(app, opts) {
	const { context } = opts;
	await app.register(batchRoutes, { prefix: '/batchs', context });
	await app.register(imageRoutes, { prefix: '/images' });
};
