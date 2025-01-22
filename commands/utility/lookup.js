const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {toEmbed, database} = require("../../storage.js");
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
        await interaction.deferReply();
        let id = interaction.options.getInteger('id');
        let fac = await database.findOne({id: id});
        if (fac) {
            let embed = toEmbed(fac);
            // fac.traffic.lookups++;
            let response = await database.updateOne({id: id}, {$inc: {lookups: 1}});
            console.log(response);
            await interaction.editReply({embeds: embed});
        } else {
            await interaction.editReply("No facility with id " + id + " could be found!");
        }
    }
}
