const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const storage = require("../../storage.js");
const allfacs = storage.allfacs;
const data = new SlashCommandBuilder()
    .setName("lookup")
    .setDescription("Lookup specific details about a facility given an id")
    .addIntegerOption((option) => option
        .setName("id")
        .setDescription("Enter the id of a facility to lookup")
        .setRequired(true)

    );

module.exports = {
    data: data,
    async execute(interaction) {
        let id = interaction.options.getInteger('id');
        let fac = allfacs.facility_id_tracker[id];
        if (fac) {
            let embed = fac.toEmbed();
            await interaction.reply({ content: "", embeds: embed });
        } else {
            await interaction.reply("No facility with id " + id + " could be found!");
        }

    }
}
