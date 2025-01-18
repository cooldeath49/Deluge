const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const {database} = require("../../storage.js");
const data = new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Admin only")

module.exports = {
    data: data,
    async execute(interaction) {
        if (interaction.user.id == "265180213783166976") {
            const modal = new ModalBuilder()
            .setCustomId("password")
            .setTitle("Password")

            let regimentinput = new TextInputBuilder()
            .setCustomId("pw")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(30)
    
            row = new ActionRowBuilder().addComponents(regimentinput)
    
            modal.addComponents(row);
    
            await interaction.showModal(modal);
    
            interaction.awaitModalSubmit({
                time: 60_000,
                filter: i => i.user.id === interaction.user.id,
            })
            .then(async submitted => {
                if (!submitted.isModalSubmit() || submitted.customId != "password") return; 
                if (submitted.fields.getTextInputValue("pw") != require("../../config.json").PASSWORD) {
                    interaction.followUp("Clear failed")
                }
                let result = await database.deleteMany({id: {$gte: 0}})
                if (result.deletedCount >= 0) {
                    interaction.followUp("Successfully deleted " + result.deletedCount + " facilities");
                } else {
                    interaction.followUp("Failed to delete facilities");
                }
                
            }).catch(e => interaction.followUp("failed"))
        } else {
            interaction.reply("deezn't");
        }
    }
}
