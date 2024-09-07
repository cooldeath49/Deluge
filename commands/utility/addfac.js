const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const storage = require('../../storage.js');
const allfacs = storage.allfacs;
const allhexes = storage.allhexes;
const Facility = storage.Facility;
const data = new SlashCommandBuilder()
.setName("addfac")
.setDescription("Register a facility with the bot")
.addStringOption(option =>
  option.setName("coordinates")
  .setDescription("Ctrl+click on the map and paste coordinates of the facility")
  .setRequired(true))
.addStringOption(option =>
  option.setName("regiment")
  .setDescription("regiment tag")
  .setRequired(true));


function addFacility(hex, letter, letternumber, grid, reg) {
  let facility = new Facility(hex, letter, letternumber, grid, allfacs.length, reg);
  allfacs.push(facility);
  console.log("Added " + reg + " facility at " + letter + letternumber + "k" + grid + ", ID=" + facility.id);
  return facility;
}


module.exports = {
  data: data,
  async execute(interaction) {
    // const response = interaction.deferReply();
    let coord = interaction.options.getString('coordinates');
    let reg = interaction.options.getString('regiment');

    let keypadindex = coord.search('-');
    if (keypadindex == -1) {
      interaction.editReply("Improper command: facility coordinates must be of the form `HexName-KeypadEntry`\n");
      return;
    } else {
      let hex = coord.substring(0, keypadindex); //Returns hex text
      let keypad = coord.substring(keypadindex + 1); //Returns keypad text

      let gridindex = keypad.search('k'); //Returns small-keypad index
      let grid = keypad.substring(gridindex + 1); //returns small-keypad text
      let letter = keypad.substring(0, 1).toUpperCase(); //gets letter
      let letternumber = keypad.substring(1, gridindex); //gets letter number
      if (allhexes.includes(hex)) {
        let yes = new ButtonBuilder()
        .setCustomId('add pw')
        .setLabel("Yes")
        .setStyle("Success");

        let no = new ButtonBuilder()
        .setCustomId("no pw")
        .setLabel("No")
        .setStyle("Danger");

        let row = new ActionRowBuilder()
        .addComponents(yes, no);
        
        console.log(hex + " " + letter + letternumber + "k" + grid);
        let fac = addFacility(hex, letter, letternumber, grid, reg);
        interaction.followUp({content: "Would you like to set a password?", components: [row]});

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
          const confirmation = await interaction.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

          if (confirmation.customId == 'add pw') {
            const modal = new ModalBuilder()
            .setCustomId("pw modal")
            .setTitle("Deluge");

            const textBuilder = new TextInputBuilder()
            .setCustomId("pw text")
            .setLabel("Please enter a password.")
            .setStyle(TextInputStyle.Short);

            const actionRow = new ActionRowBuilder().addComponents(textBuilder);

            modal.addComponents(actionRow);
            await confirmation.showModal(modal);
            
            // confirmation.update({content: "Got a yes!", components: []});
          } else if (confirmation.customId == 'reject edit fac') {
            confirmation.update({content: "Got a no!", components: []});
          }

        } catch (e) {
          console.log(e);
          await interaction.followUp({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }

        
      } else {
        interaction.editReply("Could not find target hex \"" + hex + "\"");
      }

    }
  }
  
  // "Added " + reg + " facility at " + hex + "-" + letter + letternumber + "k" + grid + ", ID=" + fac.id + ", w
}