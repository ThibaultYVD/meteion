const db = require('@models');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	customId: 'participant',
	async execute(interaction) {
		try {
			const { user, member, guild, message } = interaction;

			await interaction.deferReply({ ephemeral: true });

			const [userRecord, userCreated] = await db.User.findOrCreate({
				where: { user_id: user.id },
				defaults: {
					username: user.username,
					global_name: user.globalName,
					added_date: new Date(),
				},
			});

			if (!userCreated) {
				await userRecord.update({
					username: user.username,
					global_name: user.globalName,
				});
			}

			const [guildRecord, guildCreated] = await db.Guild.findOrCreate({
				where: { guild_id: guild.id },
				defaults: {
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
					added_date: new Date(),
				},
			});

			if (!guildCreated) {
				await guildRecord.update({
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
				});
			}

			await db.GuildMember.upsert({
				guild_id: guild.id,
				user_id: user.id,
				user_nickname: member.nickname || null,
				last_bot_interaction: new Date(),
			});


			const isParticipant = await handleUserChoice(interaction);

			const userChoices = await db.sequelize.query(`
				SELECT u.global_name, gm.user_nickname, c.choice_id, c.choice_name
				FROM user_event_choices uec
				JOIN users u ON u.user_id = uec.user_id
				LEFT JOIN guild_members gm ON gm.user_id = u.user_id AND gm.guild_id = :guild_id
				JOIN choices c ON c.choice_id = uec.choice_id
				WHERE uec.event_id = :event_id
				ORDER BY uec.added_at ASC
			  `, {
				replacements: { event_id: message.id, guild_id: guild.id },
				type: db.sequelize.QueryTypes.SELECT,
			});

			const { participants, indecis, reservistes, absents } = sortUserChoices(userChoices);

			// INFO: Récupération de l'embed de l'interaction puis on met seulement à jour les valeurs des colonnes Participants/Indécis/Réserviste
			const embed = message.embeds[0];

			const participantFieldIndex = embed.fields.findIndex(field => field.name.includes('Participants'));
			embed.fields[participantFieldIndex].name = `✅ Participants (${participants.length})`;
			embed.fields[participantFieldIndex].value = formatList(participants);

			const indecisFieldIndex = embed.fields.findIndex(field => field.name.includes('Indécis'));
			embed.fields[indecisFieldIndex].name = `❓Indécis (${indecis.length})`;
			embed.fields[indecisFieldIndex].value = formatList(indecis);

			const reservisteFieldIndex = embed.fields.findIndex(field => field.name.includes('En réserve'));
			embed.fields[reservisteFieldIndex].name = `🪑 En réserve (${reservistes.length})`;
			embed.fields[reservisteFieldIndex].value = formatList(reservistes);

			const absentFieldIndex = embed.fields.findIndex(field => field.name.includes('Absents'));
			embed.fields[absentFieldIndex].name = `❌ Absents (${absents.length})`;
			embed.fields[absentFieldIndex].value = formatList(absents);

			await interaction.message.edit({ embeds: [embed] });

			if (isParticipant == true) await interaction.followUp({ content: 'Vous êtes inscrit en tant que **Participant** !', ephemeral: true });
			else await interaction.followUp({ content: 'Vous êtes désinscrit.', ephemeral: true });

			setTimeout(async () => {
				await interaction.deleteReply();
			}, 2000);
		}
		catch (error) {
			console.error('Erreur lors du traitement du choix.', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors du traitement du choix.',
				ephemeral: true,
			});
		}
	},
};

function sortUserChoices(userChoices) {
	const participants = [];
	const indecis = [];
	const reservistes = [];
	const absents = [];

	userChoices.forEach((userchoice) => {
		let displayName;
		if (userchoice.user_nickname == null) displayName = userchoice.global_name;
		else displayName = userchoice.user_nickname;

		switch (userchoice.choice_id) {
		case 1:
			participants.push(displayName);
			break;
		case 2:
			indecis.push(displayName);
			break;
		case 3:
			reservistes.push(displayName);
			break;
		case 4:
			absents.push(displayName);
			break;
		}
	});

	return { participants, indecis, reservistes, absents };
}

async function handleUserChoice(interaction) {
	try {
		const [event, existingChoice, participantChoice] = await Promise.all([
			db.Event.findOne({ where: { event_id: interaction.message.id } }),
			db.UserEventChoice.findOne({
				where: { event_id: interaction.message.id, user_id: interaction.user.id },
			}),
			db.Choice.findOne({ where: { choice_name: 'Participant' } }),
		]);

		if (!event) throw new Error(`L'événement avec l'ID ${interaction.message.id} n'existe pas`);
		if (!participantChoice) throw new Error('Choix "Participant" non trouvé dans la base de données');

		let isParticipant = false;

		if (!existingChoice) {
			await db.UserEventChoice.create({
				user_id: interaction.user.id,
				event_id: interaction.message.id,
				choice_id: participantChoice.choice_id,
				added_at: new Date(),
			});
			isParticipant = true;
		}
		else if (existingChoice.choice_id !== participantChoice.choice_id) {
			await existingChoice.update({ choice_id: participantChoice.choice_id, added_at: new Date() });
			isParticipant = true;
		}
		else {
			await existingChoice.destroy();
			isParticipant = false;
		}
		return isParticipant;
	}
	catch (error) {
		console.error('Erreur lors du traitement du choix de l\'utilisateur :', error);
	}
}


function formatList(list) {
	// INFO: Soit il y a des éléments et alors on ajoute un '-' avant le nom, soit on renvoie un caractère vide
	return list.length ? list.map(item => `> ${item}\n`).join('') : '\u200B';
}