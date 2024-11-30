const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../models/Models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Ouvre les paramètres de Météion.')
		.setDescriptionLocalizations({
			'en-US': 'Open Meteion\'s settings.',
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),


	async execute(interaction) {
		try {
			const { guild, user, member, client } = interaction;

			// INFO: Met à jour les infos du serveur et de l'utilisateur à l'utilisation de la commande
			await Promise.all([
				(async () => {
					const [guildRecord, created] = await db.Guild.findOrCreate({
						where: { guild_id: guild.id },
						defaults: {
							guild_name: guild.name,
							guild_total_members: guild.memberCount,
							added_date: new Date(),
						},
					});

					if (!created) {
						await guildRecord.update({
							guild_name: guild.name,
							guild_total_members: guild.memberCount,
						});
					}
				})(),

				(async () => {
					const [userRecord, created] = await db.User.findOrCreate({
						where: { user_id: user.id },
						defaults: {
							username: user.username,
							global_name: user.globalName,
							added_date: new Date(),
						},
					});

					if (!created) {
						await userRecord.update({
							username: user.username,
							global_name: user.globalName,
						});
					}

					await db.GuildMember.upsert({
						guild_id: guild.id,
						user_id: user.id,
						user_nickname: member.nickname,
						last_bot_interaction: new Date(),
					});
				})(),

				(async () => {
					const guildSettings = await db.sequelize.query(
						'SELECT DISTINCT setting_id FROM guild_settings WHERE guild_id = :guild_id',
						{
							replacements: { guild_id: guild.id },
							type: db.sequelize.QueryTypes.SELECT,
						},
					);

					const allSettings = await db.Setting.findAll();
					const existingSettingIds = guildSettings.map(gs => gs.setting_id);
					const missingSettings = allSettings.filter(setting => !existingSettingIds.includes(setting.setting_id));

					for (const setting of missingSettings) {
						await db.sequelize.query(
							'INSERT INTO guild_settings (guild_id, setting_id, activated) VALUES (:guild_id, :setting_id, :activated)',
							{
								replacements: {
									guild_id: guild.id,
									setting_id: setting.setting_id,
									activated: setting.activated_by_default,
								},
								type: db.sequelize.QueryTypes.INSERT,
							},
						);
					}

					await db.GuildMember.upsert({
						guild_id: guild.id,
						user_id: user.id,
						user_nickname: member.nickname,
						last_bot_interaction: new Date(),
					});

				})(),
			]);

			const guildSettings = await db.sequelize.query(
				`SELECT DISTINCT s.setting_display_name,
                CASE 
                    WHEN gs.activated = 'TRUE' THEN '✅ Activé'
                    ELSE '❌ Désactivé'
                END AS activation_status
                FROM guild_settings gs
                INNER JOIN settings s ON gs.setting_id = s.setting_id
                WHERE guild_id = :guild_id;`,
				{
					replacements: { guild_id: guild.id },
					type: db.sequelize.QueryTypes.SELECT,
				},
			);

			await interaction.reply({ embeds: [getSettingsEmbed(interaction, client, guildSettings)], components: [getSettingsRows()], ephemeral:true });
		}
		catch (error) {
			console.error(error);
		}

	},
};

function getSettingsEmbed(interaction, client, guildSettings) {
	const embed = new EmbedBuilder()
		.setColor(client.color)
		.setTitle(`Paramètres du serveur ${interaction.guild.name}`)
		.addFields(
			{ name: '📅 Paramètres des événements', value: '------------------------' },
		)
		.setImage('https://i.stack.imgur.com/Fzh0w.png')
		.setFooter({
			text: `${client.user.username}`,
			iconURL: client.user.displayAvatarURL({ dynamic: false }),
		});

	guildSettings.forEach(setting => {
		embed.addFields({
			name: `- ${setting.setting_display_name}`,
			value: setting.activation_status,
			inline: true,
		});
	});

	return embed;
}

function getSettingsRows() {
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('toggleCloseEvent')
				.setLabel('Changer Auto-suppression des événements')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('toggleEventReminder')
				.setLabel('Changer Message de rappel')
				.setStyle(ButtonStyle.Secondary),
		);

	return row;
}