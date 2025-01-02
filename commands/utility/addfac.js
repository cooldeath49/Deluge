const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  ActionRow

} = require('discord.js');
const {hexes1, hexes2, add, toEmbed, letter_map, number_map, hexes1only} = require('../../storage.js');

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

async function handleInteraction(interaction, fac) {
  // interaction.deferReply();
  //Button related
  if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
      embeds: [],
    });
  } else if (interaction.customId == "test facility") {
    let response = add({
      hex: "Marban Hollow", 
      town: "Lockheed", 
      letter: "A", 
      number: 4, 
      regiment: "ISO", 
      contact: "cooldeath49", 
      nickname: "nickname", 
      field: null, 
      relative: "East"
    });
    if (!response) {
      await interaction.update("Failed to add facility!");
    } else {
      await interaction.update({
        content: 'Added test facility',
        components: [],
        embeds: [],
      });
    }
    
  } else if (interaction.customId == "add") {
    select = new StringSelectMenuBuilder()
      .setCustomId('hex select')
      .setPlaceholder('Select hex of your facility:')
      .addOptions(hexes1only.map((hex) => new StringSelectMenuOptionBuilder()
        .setLabel(hex)
        .setDescription(hex)
        .setValue(hex)
      ));

    let row = new ActionRowBuilder().addComponents(select);
    let buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);

    const response = await interaction.update({
      content: 'Choose your facility hex (page 1/2):',
      components: [row, buttonrow],
      embeds: [],
    });

    //Paste coordinates
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
      .addOptions(hexes1only.map(hex => new StringSelectMenuOptionBuilder()
        .setLabel(hex)
        .setDescription(hex)
        .setValue(hex)
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
    fac.hex = interaction.values[0];
    let chunk = hexes1.find((chunk) => chunk[0] == fac.hex);
    chunk.shift();
    select.spliceOptions(0, 25)
      .addOptions(chunk.map((town) => new StringSelectMenuOptionBuilder()
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
    fac.town = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(letter_map.map((letter) => new StringSelectMenuOptionBuilder()
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
    fac.letter = interaction.values[0];
    select.spliceOptions(0, 25)
      .addOptions(number_map.map((number) => new StringSelectMenuOptionBuilder()
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
    fac.number = interaction.values[0];
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
          .setLabel("North of " + fac.town)
          .setDescription("North of " + fac.town)
          .setValue("North"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Northeast of " + fac.town)
            .setDescription("Northeast of " + fac.town)
            .setValue("Northeast"),
          new StringSelectMenuOptionBuilder()
            .setLabel("East of " + fac.town)
            .setDescription("East of " + fac.town)
            .setValue("East"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Southeast of " + fac.town)
            .setDescription("Southeast of " + fac.town)
            .setValue("Southeast"),
          new StringSelectMenuOptionBuilder()
            .setLabel("South of " + fac.town)
            .setDescription("South of " + fac.town)
            .setValue("South"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Southwest of " + fac.town)
            .setDescription("Southwest of " + fac.town)
            .setValue("Southwest"),
          new StringSelectMenuOptionBuilder()
            .setLabel("West of " + fac.town)
            .setDescription("West of " + fac.town)
            .setValue("West"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Northwest of " + fac.town)
            .setDescription("Northwest of " + fac.town)
            .setValue("Northwest"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Right next to " + fac.town)
            .setDescription("Within ~40m of " + fac.town + " TH/Relic")
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
        fac.field = interaction.values[0];
      } else {
        fac.relative = interaction.values[0];
      }
      const modal = new ModalBuilder()
        .setCustomId("regiment modal")
        .setTitle("Regiment")

      let regimentinput = new TextInputBuilder()
        .setCustomId("regiment")
        .setLabel("What regiment owns this? Leave empty if none")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
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

      fac.regiment = submitted.fields.getTextInputValue("regiment");
      fac.contact = submitted.fields.getTextInputValue("contact");
      fac.nickname = submitted.fields.getTextInputValue("nickname");

      let newfac = await add(fac);

      if (newfac) {
        let embed2 = new EmbedBuilder()
        .setTitle("Successfully added a facility!")
        .setDescription("Use /editfac to add a password and edit remaining facility details")
      await interaction.editReply({ content: "", embeds: [embed2].concat(toEmbed(fac)), components: [] })
      } else {
        
        await interaction.editReply("Failed to add facility, internal error");
      }
      

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
    let addbutton = new ButtonBuilder()
      .setCustomId("add")
      .setLabel("Add Facility")
      .setStyle(ButtonStyle.Success)

    let testbutton = new ButtonBuilder() //for debugging only
      .setCustomId("test facility")
      .setLabel("Add Test Facility")
      .setStyle(ButtonStyle.Secondary)

    let row = new ActionRowBuilder().addComponents(addbutton, cancel, testbutton);

    let embed = new EmbedBuilder().setTitle("Would you like to add a facility?");
    // [chosen_hex, fac.town, grid_letter, grid_number, regiment, contact, nickname, field, relative]);
    let fac = {
      hex: null,
      town: null,
      letter: null,
      number: null,
      regiment: null,
      contact: null,
      nickname: null,
      field: null,
      relative: null,
    }

    let response = await interaction.reply({
      content: "",
      components: [row],
      embeds: [embed],
    })

    response.createMessageComponentCollector({
      componentType: ComponentType.Button, 
      time: 3_600_000,
      filter: i => i.user.id === interaction.user.id,
    }).on('collect', async i2 => {
      handleInteraction(i2, fac);
    });
    
    response.createMessageComponentCollector({ 
      componentType: ComponentType.StringSelect, 
      time: 3_600_000, 
      filter: i => i.user.id === interaction.user.id, 
    }).on('collect', async i2 => {
      handleInteraction(i2, fac);
    });


  }

  // "Added " + reg + " facility at " + hex + "-" + letter + letternumber + "k" + grid + ", ID=" + fac.id + ", w
}