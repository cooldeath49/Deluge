const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const storage = require("../../storage.js");
const { execute } = require('./listfac.js');
const allfacs = storage.allfacs;
const coord = storage.coord;
const data = new SlashCommandBuilder()
.setName('editfac')
.setDescription("Edit a pre-existing facility")
.addIntegerOption((option) => 
  option.setName('fac-id')
                  .setDescription("Enter the ID of a facility")
                  .setRequired(true));

module.exports = {
  data: data,
  async execute(interaction) {
    let id = interaction.options.getInteger('fac-id');
    if (allfacs.length >= id && allfacs[id]) {
      let fac = allfacs[id];
      let yes = new ButtonBuilder()
      .setCustomId('confirm edit fac')
      .setLabel("Yes")
      .setStyle("Success");

      let no = new ButtonBuilder()
      .setCustomId("reject edit fac")
      .setLabel("No")
      .setStyle("Danger");
      
      let row = new ActionRowBuilder()
      .addComponents(yes, no);
      
      let response = await interaction.reply({
        content: "Do you wish to edit the " + fac.regiment + " facility at " + coord(fac) + "?",
        components: [row]});
      const collectorFilter = i => i.user.id === interaction.user.id;

      try {
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        if (confirmation.customId == 'confirm edit fac') {
          confirmation.update({content: "Got a yes!", components: []});
        } else if (confirmation.customId == 'reject edit fac') {
          confirmation.update({content: "Got a no!", components: []});
        }

      } catch (e) {
        await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
      }
      
    } else {
      interaction.reply("No facility found with ID " + id);
      
    }
  }
}