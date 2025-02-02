const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const {toEmbed, database, createHexImage} = require("../../storage.js");
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
            await database.updateOne({id: id}, {$inc: {lookups: 1}});
            let buffer = await createHexImage([fac], fac.hex);
            let file = new AttachmentBuilder(buffer);
            await interaction.editReply({embeds: embed, files: [file]});
        } else {
            await interaction.editReply("No facility with id " + id + " could be found!");
        }
    }
}
