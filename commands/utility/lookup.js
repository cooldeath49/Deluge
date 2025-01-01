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

const {MongoClient} = require("mongodb");
const uri = storage.uri;

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.deferReply();
        let id = interaction.options.getInteger('id');
        let fac = await database.findOne({id: id});

        if (fac) {
            console.log(fac);
            let embed = storage.toEmbed(fac);
            await interaction.editReply({embeds: embed});
        } else {
            await interaction.editReply("No facility with id " + id + " could be found!");
        }


        /*let fac = allfacs.facility_id_tracker[id];
        if (fac) {
            let embed = fac.toEmbed();
            await interaction.reply({ content: "", embeds: embed });
        } else {
            await interaction.reply("No facility with id " + id + " could be found!");
        }*/

    }
}
