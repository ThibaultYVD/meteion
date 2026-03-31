class EventChoiceService {
	constructor(eventRepository, choiceRepository, userEventChoiceRepository) {
		this.eventRepository = eventRepository;
		this.choiceRepository = choiceRepository;
		this.userEventChoiceRepository = userEventChoiceRepository;
	}

	/**
	 * Bascule le choix d'un utilisateur pour un événement (toggle).
	 * Crée le choix s'il n'existe pas, le met à jour s'il diffère, le supprime s'il est identique.
	 * @returns {Promise<boolean>} true si le choix est maintenant actif, false s'il a été retiré.
	 */
	async toggleUserChoice(eventId, userId, choiceName) {
		const [event, existingChoice, choice] = await Promise.all([
			this.eventRepository.findById(eventId),
			this.userEventChoiceRepository.findOne({ event_id: eventId, user_id: userId }),
			this.choiceRepository.findOne({ choice_name: choiceName }),
		]);

		if (!event) throw new Error(`L'événement avec l'ID ${eventId} n'existe pas`);
		if (!choice) throw new Error(`Choix "${choiceName}" non trouvé dans la base de données`);

		if (!existingChoice) {
			await this.userEventChoiceRepository.create({
				user_id: userId,
				event_id: eventId,
				choice_id: choice.choice_id,
				added_at: new Date(),
			});
			return true;
		}
		else if (existingChoice.choice_id !== choice.choice_id) {
			await existingChoice.update({ choice_id: choice.choice_id, added_at: new Date() });
			return true;
		}
		else {
			await existingChoice.destroy();
			return false;
		}
	}

	/**
	 * Récupère les choix d'un événement groupés par catégorie.
	 * @returns {Promise<{participants: string[], indecis: string[], reservistes: string[], absents: string[]}>}
	 */
	async getChoicesForEmbed(eventId, guildId) {
		const userChoices = await this.userEventChoiceRepository.findChoicesWithUsers(eventId, guildId);
		return this._sortChoices(userChoices);
	}

	/**
	 * Met à jour les champs de l'embed avec les listes de participants par catégorie.
	 */
	updateEmbed(embed, { participants, indecis, reservistes, absents }) {
		const findField = (keyword) => embed.fields.findIndex(f => f.name.includes(keyword));

		const pi = findField('Participants');
		if (pi !== -1) {
			embed.fields[pi].name = `✅ Participants (${participants.length})`;
			embed.fields[pi].value = this._formatList(participants);
		}

		const ii = findField('Indécis');
		if (ii !== -1) {
			embed.fields[ii].name = `❓Indécis (${indecis.length})`;
			embed.fields[ii].value = this._formatList(indecis);
		}

		const ri = findField('En réserve');
		if (ri !== -1) {
			embed.fields[ri].name = `🪑 En réserve (${reservistes.length})`;
			embed.fields[ri].value = this._formatList(reservistes);
		}

		const ai = findField('Absents');
		if (ai !== -1) {
			embed.fields[ai].name = `❌ Absents (${absents.length})`;
			embed.fields[ai].value = this._formatList(absents);
		}
	}

	_sortChoices(userChoices) {
		const participants = [];
		const indecis = [];
		const reservistes = [];
		const absents = [];

		for (const uc of userChoices) {
			const displayName = uc.user_nickname ?? uc.global_name;
			switch (uc.choice_id) {
			case 1: participants.push(displayName); break;
			case 2: indecis.push(displayName); break;
			case 3: reservistes.push(displayName); break;
			case 4: absents.push(displayName); break;
			}
		}

		return { participants, indecis, reservistes, absents };
	}

	_formatList(list) {
		return list.length ? list.map(item => `> ${item}\n`).join('') : '\u200B';
	}
}

module.exports = EventChoiceService;
