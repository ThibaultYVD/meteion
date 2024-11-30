const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// INFO: Charger dynamiquement les fichiers de modals
const modals = {};
const modalsPath = path.join(__dirname, '../modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
	const modal = require(path.join(modalsPath, file));
	modals[modal.customId] = modal;
}

// INFO: Charger dynamiquement les fichiers de boutons
const buttons = {};
const buttonsPath = path.join(__dirname, '../buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const button = require(path.join(buttonsPath, file));
	buttons[button.customId] = button;
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		// INFO: Gérer les commandes Slash
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
				else {
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
		}

		// INFO: Gérer les soumissions de modals
		else if (interaction.isModalSubmit()) {
			const modalHandler = modals[interaction.customId];
			if (modalHandler) {
				try {
					await modalHandler.execute(interaction);
				}
				catch (error) {
					console.error(`Erreur lors de l'exécution du modal ${interaction.customId}:`, error);
					await interaction.reply({ content: 'Une erreur est survenue lors de la soumission du formulaire.', ephemeral: true });
				}
			}
			else {
				console.warn(`Aucun gestionnaire trouvé pour le modal: ${interaction.customId}`);
				await interaction.reply({ content: 'Une erreur est survenue lors de la soumission du formulaire.', ephemeral: true });
			}
		}

		// INFO: Gérer les interactions de boutons
		else if (interaction.isButton()) {
			const buttonHandler = buttons[interaction.customId];
			if (buttonHandler) {
				try {
					await buttonHandler.execute(interaction);
				}
				catch (error) {
					console.error(`Erreur lors de l'exécution du bouton ${interaction.customId}:`, error);
					await interaction.reply({ content: 'Une erreur est survenue lors de l\'interaction avec le bouton.', ephemeral: true });
				}
			}
			else {
				console.warn(`Aucun gestionnaire trouvé pour le bouton: ${interaction.customId}`);
				await interaction.reply({ content: 'Une erreur est survenue lors de l\'interaction avec le bouton.', ephemeral: true });
			}
		}
	},
};
