const { getErrorEmbed } = require('@embeds/errorEmbedBuilder');

// Application/services/ErrorService.js
class AppError extends Error {
	/**
   * @param {string} code - code machine-readable (ex: 'DATE_IN_PAST')
   * @param {string} [devMessage] - message pour les logs (dev)
   * @param {object} [meta] - données additionnelles pour le debug
   * @param {number} [httpStatus] - si tu exposes un API un jour
   */
	constructor(code, devMessage = '', meta = {}, httpStatus = 400) {
		super(devMessage || code);
		this.name = 'AppError';
		this.code = code;
		this.meta = meta;
		this.httpStatus = httpStatus;
		Error.captureStackTrace?.(this, this.constructor);
	}
}

const ErrorCodes = {
	INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
	INVALID_DATE_PARSE: 'INVALID_DATE_PARSE',
	DATE_IN_PAST: 'DATE_IN_PAST',
	UNKNOWN: 'UNKNOWN',
};

// catalogue des messages **utilisateur**
const errorCatalog = {
	[ErrorCodes.INVALID_DATE_FORMAT]: 'Format de date/heure invalide. Merci de respecter le format.',
	[ErrorCodes.INVALID_DATE_PARSE]: 'Impossible d’analyser la date/heure. Vérifie le format.',
	[ErrorCodes.DATE_IN_PAST]: 'La date/heure doit être dans le futur.',
	[ErrorCodes.UNKNOWN]: 'Une erreur est survenue. Merci de réessayer plus tard.',
};

/**
 * Transforme n’importe quelle erreur en AppError
 */
function normalize(error) {
	if (error instanceof AppError) return error;

	if (error?.message && errorCatalog[error.message]) {
		return new AppError(error.message, error.stack || error.message);
	}

	return new AppError(ErrorCodes.UNKNOWN, error?.stack || String(error));
}

/**
 * Récupère le message utilisateur
 */
function toUserMessage(error, client, interaction) {
	const code = error?.code || ErrorCodes.UNKNOWN;

	// Si tu veux i18n :
	const t = client?.i18next?.t?.bind(client?.i18next);
	if (t) {
		const key = `errors.${code}`;
		const translated = t(key, { defaultValue: errorCatalog[code] || errorCatalog.UNKNOWN });
		if (translated) return translated;
	}

	return errorCatalog[code] || errorCatalog.UNKNOWN;
}

/**
 * Répond à l’utilisateur proprement (reply ou followUp selon l’état)
 */
async function reply(interaction, client, rawError, { ephemeral = true } = {}) {
	const error = normalize(rawError);
	const userMessage = toUserMessage(error, client, interaction);

	// Log côté serveur/dev
	console.error(`[${error.code}]`, error.meta ?? {}, error.stack ?? error.message);

	const embed = getErrorEmbed(client, `**${userMessage}**`);

	if (interaction.deferred || interaction.replied) {
		return interaction.followUp({ embeds: [embed], ephemeral });
	}
	return interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Petit helper pour créer rapidement des erreurs
 */
const createError = (code, devMessage, meta) => new AppError(code, devMessage, meta);

module.exports = {
	AppError,
	ErrorCodes,
	_errorService: {
		reply,
		normalize,
		toUserMessage,
		createError,
	},
};
