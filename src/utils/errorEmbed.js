const { EmbedBuilder } = require('discord.js');

function errorEmbed(client, message) {
	return new EmbedBuilder()
		.setColor(0xFF0000)
		.setTitle(client.i18next.t('global.error.error_occured_title'))
		.setDescription(`${message}\n${client.i18next.t('global.error.error_occured_description')}`)
		.setTimestamp();
}

module.exports = errorEmbed;