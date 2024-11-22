const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
ActionRow

 } = require('discord.js');
const storage = require('../../storage.js');
const order = [
]
const allfacs = storage.allfacs;
const hexes1 = storage.hexes1;
const hexes2 = storage.hexes2;
const Facility = storage.Facility;
let chosen_hex;
let chosen_town;
let keypad_letter;
let keypad_number;
const data = new SlashCommandBuilder()
.setName("addfac")
.setDescription("Register a facility with the bot")


let other_page = new ButtonBuilder()
.setCustomId("switch page 1")
.setLabel("Switch Page")
.setStyle(ButtonStyle.Secondary);
let cancel = new ButtonBuilder()
.setCustomId("cancel")
.setLabel("Cancel")
.setStyle(ButtonStyle.Danger);
let skip = new ButtonBuilder()
.setCustomId("skip")
.setLabel("Skip")
.setStyle(ButtonStyle.Secondary);

let select = new StringSelectMenuBuilder();


function addFacility(hex, letter, letternumber, grid, reg) {
  let facility = new Facility(hex, letter, letternumber, grid, allfacs.length, reg);
  allfacs.push(facility);
  console.log("Added " + reg + " facility at " + letter + letternumber + "k" + grid + ", ID=" + facility.id);
  return facility;
}

async function handleInteraction(interaction) {

  //Button related
  if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
      ephemeral: true,
      });
  } else if (interaction.customId == "switch page 1") { //switch to the second page
    select.spliceOptions(0,19)
      .addOptions(hexes2.map((hex) => new StringSelectMenuOptionBuilder()
            .setLabel(hex.label)
            .setDescription(hex.description)
            .setValue(hex.value)
      )
    );
    other_page.setCustomId("switch page 2");
    
    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
    
    await interaction.update({
      content: 'Choose your facility hex (page 2/2):',
      components: [row, buttonrow],
      ephemeral: true,
    });

  } else if (interaction.customId == "switch page 2") { //Switch to page 1
    select.spliceOptions(0,19)
      .addOptions(hexes1.map((hex) => new StringSelectMenuOptionBuilder()
            .setLabel(hex.label)
            .setDescription(hex.description)
            .setValue(hex.value)
      )
    );
    other_page.setCustomId("switch page 1");
    
    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
    
    await interaction.update({
      content: 'Choose your facility hex (page 1/2):',
      components: [row, buttonrow],
      ephemeral: true,
      });
  } else if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
      ephemeral: true,
      });

  //Selection made for hex, string select
  } else if (interaction.customId == "hex select") {
    chosen_hex = interaction.values[0];
    console.log(interaction.values);
    select.spliceOptions(0,25)
      .addOptions(storage.testhex[chosen_hex].map((town) => new StringSelectMenuOptionBuilder()
            .setLabel(town)
            .setDescription(town)
            .setValue(town)
      )
    )
    .setCustomId('town select')
    .setPlaceholder('Select town of your facility:')
    ;
    
    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select hex town:',
      components: [row, buttonrow],
      ephemeral: true,
    });

  //Selection made for town
  } else if (interaction.customId == "town select") {
    chosen_town = interaction.values[0];
    select.spliceOptions(0,25)
      .addOptions(storage.grid_letter.map((letter) => new StringSelectMenuOptionBuilder()
            .setLabel(letter.toString())
            .setDescription(letter.toString())
            .setValue(letter.toString())
      )
    )
    .setCustomId('grid letter select')
    .setPlaceholder('Select the keypad grid-letter of your location:')
    ;
    
    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select grid letter:',
      components: [row, buttonrow],
      ephemeral: true,
    });

    //Selection made for letter
  } else if (interaction.customId == "grid letter select") {
    chosen_town = interaction.values[0];
    select.spliceOptions(0,25)
      .addOptions(storage.grid_number.map((number) => new StringSelectMenuOptionBuilder()
            .setLabel(number.toString())
            .setDescription(number.toString())
            .setValue(number.toString())
      )
    )
    .setCustomId('grid number select')
    .setPlaceholder('Select the keypad grid-number of your location:')
    ;
    
    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select grid number:',
      components: [row, buttonrow],
      ephemeral: true,
    });
  }
}


module.exports = {
  data: data,
  async execute(interaction) {
    select = new StringSelectMenuBuilder()
			.setCustomId('hex select')
			.setPlaceholder('Select hex of your facility:')
      
      .addOptions(hexes1.map((hex) => new StringSelectMenuOptionBuilder()
          .setLabel(hex.label)
          .setDescription(hex.description)
          .setValue(hex.value)
        )
			);
    let row = new ActionRowBuilder().addComponents(select);
    let buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);


    const response = await interaction.reply({
      content: 'Choose your facility hex (page 1/2):',
      components: [row, buttonrow],
      ephemeral: true,
    });

    const buttoncollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
    const stringcollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
    
    //Collect responses from buttons
    buttoncollector.on('collect', async i2 => {
      handleInteraction(i2);

      // if (i2.customId == "cancel") {
      //   await i2.update({
      //     content: 'Interaction cancelled!',
      //     components: [],
      //     ephemeral: true,
      //     });
      // } else if (i2.customId == "switch page 1") { //switch to the second page
      //   select.spliceOptions(0,19)
      //     .addOptions(hexes2.map((hex) => new StringSelectMenuOptionBuilder()
      //           .setLabel(hex.label)
      //           .setDescription(hex.description)
      //           .setValue(hex.value)
      //     )
      //   );
      //   other_page.setCustomId("switch page 2");
        
      //   row = new ActionRowBuilder().addComponents(select);
      //   buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
        
      //   await i2.update({
      //     content: 'Choose your facility hex (page 2/2):',
      //     components: [row, buttonrow],
      //     ephemeral: true,
      //   });

      // } else if (i2.customId == "switch page 2") { //Switch to page 1
      //   select.spliceOptions(0,19)
      //     .addOptions(hexes1.map((hex) => new StringSelectMenuOptionBuilder()
      //           .setLabel(hex.label)
      //           .setDescription(hex.description)
      //           .setValue(hex.value)
      //     )
      //   );
      //   other_page.setCustomId("switch page 1");
        
      //   row = new ActionRowBuilder().addComponents(select);
      //   buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
        
      //   await i2.update({
      //     content: 'Choose your facility hex (page 1/2):',
      //     components: [row, buttonrow],
      //     ephemeral: true,
      //     });
      // } 
    });

    //String selection
    stringcollector.on('collect', async i2 => {
      console.log(i2.customId);
      handleInteraction(i2);
      //Cancel
      // if (i2.customId == "cancel") {
      //   await i2.update({
      //     content: 'Interaction cancelled!',
      //     components: [],
      //     ephemeral: true,
      //     });
      // //Selection made for hex
      // } else if (i2.customId == "hex select") {
      //   chosen_hex = i2.values[0];
      //   console.log(i2.values);
      //   select.spliceOptions(0,25)
      //     .addOptions(storage.testhex[chosen_hex].map((town) => new StringSelectMenuOptionBuilder()
      //           .setLabel(town)
      //           .setDescription(town)
      //           .setValue(town)
      //     )
      //   )
      //   .setCustomId('town select')
      //   .setPlaceholder('Select town of your facility:')
      //   ;
        
      //   row = new ActionRowBuilder().addComponents(select);
      //   buttonrow = new ActionRowBuilder().addComponents(cancel);
      //   await i2.update({
      //     content: 'Select hex town:',
      //     components: [row, buttonrow],
      //     ephemeral: true,
      //   });
      // //Selection made for town
      // } else if (i2.customId == "town select") {
      //   chosen_town = i2.values[0];
      //   select.spliceOptions(0,25)
      //     .addOptions(storage.grid_letter.map((letter) => new StringSelectMenuOptionBuilder()
      //           .setLabel(letter.toString())
      //           .setDescription(letter.toString())
      //           .setValue(letter.toString())
      //     )
      //   )
      //   .setCustomId('grid letter select')
      //   .setPlaceholder('Select the keypad grid-letter of your location:')
      //   ;
        
      //   row = new ActionRowBuilder().addComponents(select);
      //   buttonrow = new ActionRowBuilder().addComponents(cancel);
      //   await i2.update({
      //     content: 'Select grid letter:',
      //     components: [row, buttonrow],
      //     ephemeral: true,
      //   });
      // }

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