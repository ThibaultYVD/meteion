const Fastify = require('fastify');
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');
const v1Routes = require('./routes/v1');

async function startServer(context) {
	const app = Fastify({ logger: true });

	await app.register(cors, { origin: true });
	await app.register(rateLimit, { max: 60, timeWindow: '1 minute' });

	// Santé publique sans auth
	app.get('/health', async () => ({ ok: true }));

	// Auth API key pour tout ce qui suit
	await app.register(async (instance) => {
		// instance.addHook('onRequest', authApiKey(process.env.API_KEY));
		await instance.register(v1Routes, { prefix: '/v1', context });
	});

	// Gestion erreurs
	app.setErrorHandler((err, req, reply) => {
		req.log.error(err);
		const status = err.statusCode ?? 500;
		reply.code(status).send({
			error: err.name ?? 'Error',
			message: err.message ?? 'Internal Server Error',
			status,
		});
	});

	return app;
}
module.exports = { startServer };