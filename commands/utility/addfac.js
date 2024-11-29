const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  ActionRow

} = require('discord.js');
const storage = require('../../storage.js');
const order = [
]
const allfacs = storage.allfacs;
const hexes1 = storage.hexes1;
const hexes1array = storage.hexes1array;
const hexes2 = storage.hexes2;
const Facility = storage.Facility;
let chosen_hex;
let chosen_town;
let grid_letter;
let grid_number;
let keypad
let relative;
let field;
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

async function handleInteraction(interaction) {

  //Button related
  if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
      embeds: [],
    });
  } else if (interaction.customId == "manual") {
    select = new StringSelectMenuBuilder()
      .setCustomId('hex select')
      .setPlaceholder('Select hex of your facility:')
      .addOptions(hexes1);
    let row = new ActionRowBuilder().addComponents(select);
    let buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);

    const response = await interaction.update({
      content: 'Choose your facility hex (page 1/2):',
      components: [row, buttonrow],
      embeds: [],
    });
    //Paste coordinates
  } else if (interaction.customId == "paste") {
    let modal = new ModalBuilder()
      .setCustomId("paste coordinates")
      .setTitle("Paste Coordinates")

    let pasteinput = new TextInputBuilder()
      .setCustomId("paste text")
      .setLabel("Paste click-copied coordinates here")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100)

    let row = new ActionRowBuilder().addComponents(pasteinput);

    modal.addComponents(row);

    await interaction.showModal(modal);

  } else if (interaction.customId == "switch page 1") { //switch to the second page
    select.spliceOptions(0, 19)
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
    });

  } else if (interaction.customId == "switch page 2") { //Switch to page 1
    select.spliceOptions(0, 19)
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
    });
  } else if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
    });

    //Selection made for hex, string select
  } else if (interaction.customId == "hex select") {
    chosen_hex = interaction.values[0];
    console.log(interaction.values);
    select.spliceOptions(0, 25)
      .addOptions(hexes1array.get(chosen_hex).map((town) => new StringSelectMenuOptionBuilder()
      .setLabel(town)
      .setDescription(town)
      .setValue(town)
    ))
      .setCustomId('town select')
      .setPlaceholder('Select town of your facility:')
      ;

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select hex town:',
      components: [row, buttonrow],
    });

    //Selection made for town
  } else if (interaction.customId == "town select") {
    chosen_town = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(storage.letter_map.map((letter) => new StringSelectMenuOptionBuilder()
        .setLabel(letter.toString())
        .setDescription(letter.toString())
        .setValue(letter.toString())
      )
      )
      .setCustomId('grid letter select')
      .setPlaceholder('Select the grid letter of your location:')
      ;

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select grid letter:',
      components: [row, buttonrow],
    });

    //Selection made for letter
  } else if (interaction.customId == "grid letter select") {
    grid_letter = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(storage.number_map.map((number) => new StringSelectMenuOptionBuilder()
        .setLabel(number.toString())
        .setDescription(number.toString())
        .setValue(number.toString())
      )
      )
      .setCustomId('grid number select')
      .setPlaceholder('Select the grid number of your location:')
      ;

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select grid number:',
      components: [row, buttonrow],
    });

    //Selection made for number
  } else if (interaction.customId == "grid number select") {
    grid_number = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(storage.keypad_map.map((number) => new StringSelectMenuOptionBuilder()
        .setLabel(number.toString())
        .setDescription(number.toString())
        .setValue(number.toString())
      )
      )
      .setCustomId('keypad select')
      .setPlaceholder('Select the keypad of your location within ' + grid_letter + grid_number.toString() + ':')
      ;

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select keypad number:',
      components: [row, buttonrow],
    });
  } else if (interaction.customId == "keypad select") {
    keypad = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(new StringSelectMenuOptionBuilder()
        .setLabel("Scrap Field")
        .setDescription("Scrap Field")
        .setValue("Scrap Field"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Coal Field")
          .setDescription("Coal Field")
          .setValue("Coal Field"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Component Field")
          .setDescription("Component Field")
          .setValue("Component Field"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Sulfur Field")
          .setDescription("Sulfur Field")
          .setValue("Sulfur Field"),
        new StringSelectMenuOptionBuilder()
          .setLabel("N/A")
          .setDescription("N/A")
          .setValue("N/A")
      )
      .setCustomId("field select")
      .setPlaceholder("Is your facility built on a resource field?")
    let row = new ActionRowBuilder().addComponents(select)
    let buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: 'Select field type:',
      components: [row, buttonrow],
    });

    //Final step in adding a facility
  } else if (interaction.customId == "field select" || interaction.customId == "relative select") {
    if (interaction.values[0] == "N/A") {
      select.spliceOptions(0, 25)
        .addOptions(new StringSelectMenuOptionBuilder()
          .setLabel("North of " + chosen_town)
          .setDescription("North of " + chosen_town)
          .setValue("North"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Northeast of " + chosen_town)
            .setDescription("Northeast of " + chosen_town)
            .setValue("Northeast"),
          new StringSelectMenuOptionBuilder()
            .setLabel("East of " + chosen_town)
            .setDescription("East of " + chosen_town)
            .setValue("East"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Southeast of " + chosen_town)
            .setDescription("Southeast of " + chosen_town)
            .setValue("Southeast"),
          new StringSelectMenuOptionBuilder()
            .setLabel("South of " + chosen_town)
            .setDescription("South of " + chosen_town)
            .setValue("South"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Southwest of " + chosen_town)
            .setDescription("Southwest of " + chosen_town)
            .setValue("Southwest"),
          new StringSelectMenuOptionBuilder()
            .setLabel("West of " + chosen_town)
            .setDescription("West of " + chosen_town)
            .setValue("West"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Northwest of " + chosen_town)
            .setDescription("Northwest of " + chosen_town)
            .setValue("Northwest"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Right next to " + chosen_town)
            .setDescription("Within ~40m of " + chosen_town + " TH/Relic")
            .setValue("Zero"),
        )
        .setCustomId("relative select")
        .setPlaceholder("Where is the relative location of your facility?")
      let row = new ActionRowBuilder().addComponents(select)
      let buttonrow = new ActionRowBuilder().addComponents(cancel);
      await interaction.update({
        content: 'Select relative location:',
        components: [row, buttonrow],
      });

    } else {
      if (interaction.customId == "field select") {
        field = interaction.values[0];
      } else {
        relative = interaction.values[0];
      }
      let regiment, contact, nickname;
      const modal = new ModalBuilder()
        .setCustomId("regiment modal")
        .setTitle("Regiment")
  
      let regimentinput = new TextInputBuilder()
        .setCustomId("regiment")
        .setLabel("What regiment owns this? N/A if none")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(30)
  
      let contactinput = new TextInputBuilder()
        .setCustomId("contact")
        .setLabel("Discord username of primary point of contact")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(60)
  
      let nicknameinput = new TextInputBuilder()
        .setCustomId("nickname")
        .setLabel("Nickname for your facility?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100)
  
  
      row = new ActionRowBuilder().addComponents(regimentinput)
      let secondrow = new ActionRowBuilder().addComponents(contactinput)
      let thirdrow = new ActionRowBuilder().addComponents(nicknameinput)
  
      modal.addComponents(row, secondrow, thirdrow);
  
      await interaction.showModal(modal);
  
  
      let submitted = await interaction.awaitModalSubmit({
        time: 60000,
        filter: i => i.user.id === interaction.user.id,
      }).catch(error => {
        // Catch any Errors that are thrown (e.g. if the awaitModalSubmit times out after 60000 ms)
        console.error(error)
        return null
      })
  
      regiment = submitted.fields.getTextInputValue("regiment");
      contact = submitted.fields.getTextInputValue("contact");
      nickname = submitted.fields.getTextInputValue("nickname");
      
      let embed2 = new EmbedBuilder()
      .setTitle("Successfully added a facility!")
      
      let fac = storage.add(chosen_hex, chosen_town, grid_letter, grid_number, regiment, contact, nickname, field, relative);

      await interaction.editReply({ content: "", embeds: [embed2, fac.toEmbed()], components: [] })
  
      // const modalcollector = response.createMessageComponentCollector({ componentType: ComponentType.TextInput, time: 3_600_000 });
      // modalcollector.on('collect', async i2 => {
      //   console.log(i2);
      //   handleInteraction(i2);
      // });
    }
    // grid_number = interaction.values[0];
    

  }
}

module.exports = {
  data: data,
  async execute(interaction) {
    let manualbutton = new ButtonBuilder()
      .setCustomId("manual")
      .setLabel("Manual location input")
      .setStyle(ButtonStyle.Primary)

    let pastebutton = new ButtonBuilder()
      .setCustomId("paste")
      .setLabel("I have coordinates copied to my clipboard")
      .setStyle(ButtonStyle.Primary)

    let row = new ActionRowBuilder().addComponents(manualbutton, pastebutton);
    let buttonrow = new ActionRowBuilder().addComponents(cancel);

    let embed = new EmbedBuilder().setTitle("How would you like to choose your facility location?")

    let response = await interaction.reply({
      content: "",
      components: [row, buttonrow],
      embeds: [embed],
    })

    const buttoncollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000, 
      filter: i => i.user.id === interaction.user.id, });
    const stringcollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000, filter: i => i.user.id === interaction.user.id, });

    //Collect responses from buttons
    buttoncollector.on('collect', async i2 => {
      handleInteraction(i2);
    });

    //String selection
    stringcollector.on('collect', async i2 => {
      console.log(i2.customId);
      handleInteraction(i2);

    });






  }

  // "Added " + reg + " facility at " + hex + "-" + letter + letternumber + "k" + grid + ", ID=" + fac.id + ", w
}