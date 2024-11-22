const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
ActionRow

 } = require('discord.js');
const storage = require('../../storage.js');
const allfacs = storage.allfacs;
const hexes1 = storage.hexes1;
const hexes2 = storage.hexes2;
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
    let select = new StringSelectMenuBuilder()
			.setCustomId('hex select')
			.setPlaceholder('Select hex location of your facility:')
      
      .addOptions(hexes1.map((hex) => new StringSelectMenuOptionBuilder()
          .setLabel(hex.label)
          .setDescription(hex.description)
          .setValue(hex.value)
        )
			);
    let other_page = new ButtonBuilder()
      .setCustomId("switch page 1")
      .setLabel("Switch Page")
      .setStyle(ButtonStyle.Secondary);
    let row = new ActionRowBuilder().addComponents(select);
    let buttonrow = new ActionRowBuilder().addComponents(other_page);


    const response = await interaction.reply({
      content: 'Choose your facility hex (page 1/2):',
      components: [row, buttonrow],
      ephemeral: true,
    });

    const buttoncollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
    const stringcollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

    buttoncollector.on('collect', async i2 => {
      if (i2.customId == "switch page 1") { //switch to the second page
        select.spliceOptions(0,19)
          .addOptions(hexes2.map((hex) => new StringSelectMenuOptionBuilder()
                .setLabel(hex.label)
                .setDescription(hex.description)
                .setValue(hex.value)
          )
        );
        other_page.setCustomId("switch page 2");
        
        row = new ActionRowBuilder().addComponents(select);
        buttonrow = new ActionRowBuilder().addComponents(other_page);
        
        await i2.update({
          content: 'Choose your facility hex (page 2/2):',
          components: [row, buttonrow],
          ephemeral: true,
        });

      } else if (i2.customId == "switch page 2") { //Switch to page 1
        select.spliceOptions(0,19)
          .addOptions(hexes1.map((hex) => new StringSelectMenuOptionBuilder()
                .setLabel(hex.label)
                .setDescription(hex.description)
                .setValue(hex.value)
          )
        );
        other_page.setCustomId("switch page 1");
        
        row = new ActionRowBuilder().addComponents(select);
        buttonrow = new ActionRowBuilder().addComponents(other_page);
        
        await i2.update({
          content: 'Choose your facility hex (page 1/2):',
          components: [row, buttonrow],
          ephemeral: true,
          });
      } 
    });

    stringcollector.on('collect', async i2 => {
      if (i2.customid == "hex select") {
        select.spliceOptions(0,19)
          .addOptions(storage.testhex.map((hex) => new StringSelectMenuOptionBuilder()
                .setLabel(hex.label)
                .setDescription(hex.description)
                .setValue(hex.value)
          )
        );
        
        row = new ActionRowBuilder().addComponents(select);
        
        await i2.update({
          content: 'Select hex town:',
          components: [row],
          ephemeral: true,
        });
      }

    });







    // const response = interaction.deferReply();
    /*let coord = interaction.options.getString('coordinates');
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
        let fac = addFacility(hex, letter, letternumber, grid, reg);
        let embed = {
          title: reg + '-' + hex + ' Facility',
          fields: [{
            name: 'Location',
            value: hex + '-' + keypad,
            inline: true,
            },
            {
              name: 'Regiment',
              value: reg,
            },
            {
              name: 'ID',
              value: fac.id,
            },

          ],
        }
        interaction.editReply({content: "Added facility at: ", embeds: [embed]});
      } else {
        interaction.editReply("Could not find target hex \"" + hex + "\"");
      }

    }*/
  }
  
  // "Added " + reg + " facility at " + hex + "-" + letter + letternumber + "k" + grid + ", ID=" + fac.id + ", w
}