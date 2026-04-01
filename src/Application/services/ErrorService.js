const { getErrorEmbed } = require("@embeds/errorEmbedBuilder");

// Application/services/ErrorService.js
class AppError extends Error {
  /**
   * @param {string} code - code machine-readable (ex: 'DATE_IN_PAST')
   * @param {string} [devMessage] - message pour les logs (dev)
   * @param {object} [meta] - données additionnelles pour le debug
   * @param {number} [httpStatus] - si tu exposes un API un jour
   */
  constructor(code, devMessage = "", meta = {}, httpStatus = 400) {
    super(devMessage || code);
    this.name = "AppError";
    this.code = code;
    this.meta = meta;
    this.httpStatus = httpStatus;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

const ErrorCodes = {
  INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
  INVALID_DATE_PARSE: "INVALID_DATE_PARSE",
  INVALID_NATURAL_DATE_PARSE: "INVALID_NATURAL_DATE_PARSE",
  DATE_IN_PAST: "DATE_IN_PAST",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNKNOWN: "UNKNOWN",
};

// catalogue des messages **utilisateur**
const errorCatalog = {
  [ErrorCodes.INVALID_DATE_FORMAT]:
    "Format de date/heure invalide. Merci de respecter le format.",
  [ErrorCodes.INVALID_DATE_PARSE]:
    "Impossible d’analyser la date/heure. Vérifiez le format.",
  [ErrorCodes.INVALID_NATURAL_DATE_PARSE]:
    "Le langage naturel pour la date est invalide.\nExemples fonctionnels :\n- \"demain à 21h\"\n- \"dans 2h\"\n- \"Lundi prochain à 15h\".",
  [ErrorCodes.DATE_IN_PAST]:
    "La date/heure doit être supérieur à la date/heure actuelle.",
  [ErrorCodes.EVENT_NOT_FOUND]:
    "Evénement introuvable. Merci de réessayer plus tard ou de contacter le développeur (@sorasilver_) si l'erreur persiste.",
  [ErrorCodes.UNAUTHORIZED]:
    "Vous ne pouvez pas modifier cet événement.",
  [ErrorCodes.UNKNOWN]:
    "Une erreur est survenue. Merci de réessayer plus tard ou de contacter le développeur (@sorasilver_) si l'erreur persiste.",
};

/**
 * Transforme n’importe quelle erreur en AppError
 */
function normalize(error) {
  if (error instanceof AppError) return error;

  return new AppError(ErrorCodes.UNKNOWN, error?.stack || String(error));
}

/**
 * Récupère le message utilisateur
 */
function toUserMessage(error, client) {
  const code = error?.code || ErrorCodes.UNKNOWN;

  const t = client?.i18next?.t?.bind(client?.i18next);
  if (t) {
    const key = `errors.${code}`;
    const translated = t(key, {
      defaultValue: errorCatalog[code] || errorCatalog.UNKNOWN,
    });
    if (translated) return translated;
  }

  return errorCatalog[code] || errorCatalog.UNKNOWN;
}

/**
 * Répond à l’utilisateur proprement (reply ou followUp selon l’état)
 */
async function reply(interaction, rawError, { ephemeral = true } = {}) {
  const client = interaction.client
  const error = normalize(rawError);
  const userMessage = toUserMessage(error, client);

  // Log côté serveur/dev
  if (error.code == "EVENT_NOT_FOUND" || error.code == "UNKNOWN") {
    console.error(
      `[${error.code}]`,
      error.meta ?? {},
      error.stack ?? error.message,
    );
  }

  const embed = getErrorEmbed(client, `**${userMessage}**`);

  if (interaction.deferred || interaction.replied) {
    return interaction.followUp({ embeds: [embed], ephemeral });
  }
  return interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Petit helper pour créer rapidement des erreurs
 */
const createError = (code, devMessage, meta) =>
  new AppError(code, devMessage, meta);

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
