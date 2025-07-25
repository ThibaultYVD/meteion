const { EmbedBuilder } = require('discord.js');

function getErrorEmbed(client, message) {
	return new EmbedBuilder()
		.setColor(0xFF0000)
		.setTitle(client.i18next.t('global.error.error_occured_title'))
		.setDescription(`${message}`)
		.setTimestamp();
}

module.exports = { getErrorEmbed };