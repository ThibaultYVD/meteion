/**
 * Obtient l'embed pour afficher des erreurs'.
 * @returns {embed}.
 */
function getErrorEmbed(error) {
    return errEmbed = new Discord.EmbedBuilder()
        .setTitle("New Error")
        .setColor("#FF0000")
        .setDescription("An error just occured!**\n\nERROR:\n\n** ```" + error + "```")
        .setTimestamp()
        .setFooter("Anti-Crash System")
}

module.exports = {getErrorEmbed}