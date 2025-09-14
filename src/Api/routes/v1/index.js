// src/Api/routes/v1/index.js
const batchRoutes = require('./batchs.routes.js');

module.exports = async function v1Routes(app, opts) {
	const { context } = opts;
	await app.register(batchRoutes, { prefix: '/batchs', context });
};
