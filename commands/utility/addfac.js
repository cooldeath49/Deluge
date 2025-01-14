const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  Events,

} = require('discord.js');
const {client, hexes1, hexes2, add, toEmbed, letter_map, number_map, hexes1only, items, services} = require('../../storage.js');

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
      relative: "East",
      password: null,
      imports: null,
      exports: null,
      services: null,
      choice: null,
      _id: null,
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
    
  } else if (interaction.customId == "add" || interaction.customId == "switch page 1") {
    let footer = new EmbedBuilder()
    .setTitle("Select hex")
    .setDescription("Select the hex your facility is built in.");

    let select = new StringSelectMenuBuilder()
      .setCustomId('hex select')
      .setPlaceholder('Select hex of your facility:')
      .addOptions(hexes1only.map((hex) => new StringSelectMenuOptionBuilder()
        .setLabel(hex)
        .setDescription(hex)
        .setValue(hex)
      ));

      
    other_page.setCustomId("switch page 1");

    let row = new ActionRowBuilder().addComponents(select);
    // let buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
    let buttonrow = new ActionRowBuilder().addComponents(cancel);

    await interaction.update({
      content: "",
      components: [row, buttonrow],
      embeds: [footer],
    });

    //Paste coordinates
  } else if (interaction.customId == "switch page 1") { //switch to the second page
    let select = new StringSelectMenuBuilder()
      .addOptions(hexes2.map((hex) => new StringSelectMenuOptionBuilder()
        .setLabel(hex.label)
        .setDescription(hex.description)
        .setValue(hex.value)
      )
      );
    other_page.setCustomId("switch page 2");

    row = new ActionRowBuilder().addComponents(select);
    // buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);
    let buttonrow = new ActionRowBuilder().addComponents(cancel);

    await interaction.update({
      content: 'Choose your facility hex (page 2/2):',
      components: [row, buttonrow],
    });

  } else if (interaction.customId == "switch page 2") { //Switch to page 1
    let select = new StringSelectMenuBuilder()
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
    let chunk = JSON.parse(JSON.stringify(hexes1.find((chunk) => chunk[0] == fac.hex)));
    chunk.shift();
    let select = new StringSelectMenuBuilder()
      .addOptions(chunk.map((town) => new StringSelectMenuOptionBuilder()
        .setLabel(town)
        .setDescription(town)
        .setValue(town)
      ))
      .setCustomId('town select')
      .setPlaceholder('Select town of your facility:')
      ;

    let footer = new EmbedBuilder()
    .setTitle("Select town")
    .setDescription("Select the town your facility is built in.");

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      components: [row, buttonrow],
      embeds: [footer]
    });

    //Selection made for town
  } else if (interaction.customId == "town select") {
    fac.town = interaction.values[0];
    let select = new StringSelectMenuBuilder()
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

    let footer = new EmbedBuilder()
    .setTitle("Select grid letter")
    .setDescription("Select the grid letter of your facility's coordinates. Eg. 'A' in A6, 'D' in D12, etc.");
    await interaction.update({
      components: [row, buttonrow],
      embeds: [footer]
    });

    //Selection made for letter
  } else if (interaction.customId == "grid letter select") {
    fac.letter = interaction.values[0];
    let select = new StringSelectMenuBuilder()
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
    let footer = new EmbedBuilder()
    .setTitle("Select grid letter")
    .setDescription("Select the grid number of your facility's coordinates. Eg. '6' in A6, '12' in D12, etc.");
    await interaction.update({
      components: [row, buttonrow],
      embeds: [footer]
    });

    //Selection made for number
  } else if (interaction.customId == "grid number select") {
    fac.number = interaction.values[0];
    let select = new StringSelectMenuBuilder()
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

    let footer = new EmbedBuilder()
    .setTitle("Select field placement")
    .setDescription("Specify if your facility is built near a resource field.");
    await interaction.update({
      components: [row, buttonrow],
      embeds: [footer]
    });

    //Final step in adding a facility
  } else if (interaction.customId == "yes pw") {
    if (interaction.customId == "yes pw") {
      let input = new TextInputBuilder()
      .setCustomId("new pw")
      .setLabel("Enter a new password (4 - 8 characters):")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(8)
      .setMinLength(4)

      let modal = new ModalBuilder()
        .setCustomId("new pw modal")
        .setTitle("Password")

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      await interaction.showModal(modal);

      interaction.awaitModalSubmit({
        time: 60_000,
        filter: i => i.user.id === interaction.user.id,
      })
      .then(async new_int => {
        if (!new_int.isModalSubmit() || new_int.customId != "new pw modal") return;
        let answer = new_int.fields.getTextInputValue("new pw");
        fac.password = answer;

        let newfac = await add(fac);
  
        if (newfac) {
          let embed2 = new EmbedBuilder()
          .setTitle("Successfully added a facility!")
          .setDescription("Use /editfac to edit remaining facility details")
        await interaction.editReply({ content: "", embeds: [embed2].concat(toEmbed(fac)), components: [] })
        } else {
          
          await interaction.editReply("Failed to add facility, internal error");
        }
      })
      .catch(err => {console.log("nothing was received")});

      
    }
   } else if (interaction.customId == "no pw") {
    let newfac = await add(fac);
  
    if (newfac) {
      let embed2 = new EmbedBuilder()
      .setTitle("Successfully added a facility!")
      .setDescription("Use /editfac to edit remaining facility details")
    await interaction.update({ content: "", embeds: [embed2].concat(toEmbed(fac)), components: [] })
    } else {
      
      await interaction.update("Failed to add facility, internal error");
    }
    
  } else if (interaction.customId == "field select" || interaction.customId == "relative select") {
    if (interaction.values[0] == "N/A") {
      let select = new StringSelectMenuBuilder()
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
      let footer = new EmbedBuilder()
    .setTitle("Select relative location")
    .setDescription("Using cardinal directions, specify where your facility is in reference to your town's TH or relic.");
      await interaction.update({
        components: [row, buttonrow],
        embeds: [footer]
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

      interaction.awaitModalSubmit({
        time: 60_000,
        filter: i => i.user.id === interaction.user.id,
      })
      .then(async submitted => {
        if (!submitted.isModalSubmit() || submitted.customId != "regiment modal") return;
        
        fac.regiment = submitted.fields.getTextInputValue("regiment");
        fac.contact = submitted.fields.getTextInputValue("contact");
        fac.nickname = submitted.fields.getTextInputValue("nickname");

        let embed = new EmbedBuilder()
        .setTitle("Select your facility's import categories")
        .setDescription(`Imports are what resources/items your facility processes. Players may use this information to know what resources your facility accepts.
          \nFor example, if you're a concrete-producing facility, you might choose Primitive Resources as an import, since you process Coal or Components.
          \nMost facility registrations will choose Primitive Resources for this step anyway.
          \nSpecific import items should be added later using "/editfac".
          \nFor a detailed list of each category you may run "/categories".
          \nYou may choose multiple import categories.
          \n\nThis step can be skipped or omitted if N/A.`);

        let select = new StringSelectMenuBuilder()
        .addOptions(Object.keys(items).map((category) => new StringSelectMenuOptionBuilder()
          .setLabel(category)
          .setDescription(items[category][0] + ", " + items[category][1] + ", " + items[category][2] + ", etc...")
          .setValue(category)
        )
        )
        .setCustomId('import select')
        .setPlaceholder("Select your facility\'s import categories:")
        .setMaxValues(Object.keys(items).length)
        .setMinValues(1);

        let skip = new ButtonBuilder()
        .setCustomId("skip import")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Skip");

        await interaction.editReply({content: "", components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(skip, cancel)], embeds: [embed]});

      })
      .catch((err) => {console.log("nothing received 431")});

    }
    
  } else if (interaction.customId == "import select" || interaction.customId == "skip import") {
    if (interaction.values) {
      fac.imports = interaction.values.map((element) => [element, []]);
    } else {
      fac.imports = [];
    }

    let embed = new EmbedBuilder()
        .setTitle("Select your facility's export categories")
        .setDescription(`Exports are what resources/items your facility produces. Players may readily use this information to know what your facility can produce.
          \nFor example, if you are a shell facility, you would choose Large-Caliber Weaponry as an export.
          \nSpecific export items should be added later using "/editfac".
          \nFor a detailed list of each category you may run "/categories".
          \nKeep in mind you should only choose categories that you will publicly export: private items should be omitted.
          \nYou may choose multiple export categories.
          \n\nThis step can be skipped or omitted if N/A.`);

        let select = new StringSelectMenuBuilder()
        .addOptions(Object.keys(items).map((category) => new StringSelectMenuOptionBuilder()
          .setLabel(category)
          .setDescription(items[category][0] + ", " + items[category][1] + ", " + items[category][2] + ", etc...")
          .setValue(category)
        )
        )
        .setCustomId('export select')
        .setPlaceholder("Select your facility's export categories:")
        .setMaxValues(Object.keys(items).length)
        .setMinValues(1);

        let skip = new ButtonBuilder()
        .setCustomId("skip export")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Skip");

        await interaction.update({components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(skip, cancel)], embeds: [embed]});


  } else if (interaction.customId == "export select" || interaction.customId == "skip export") {
    
    if (interaction.values) {
      fac.exports = interaction.values.map((element) => [element, []]);
    } else {
      fac.exports = [];
    }
    

    let embed = new EmbedBuilder()
        .setTitle("Select your facility's vehicle services")
        .setDescription(`Vehicle services are upgrade services you provide using vehicle pads or modification centers. Players may use this information to upgrade their vehicle using your facility.
          \nKeep in mind you should only choose public-use services: private services should be omitted.
          \nIf players need to bring their own materials, you should specify it in the Owner's Notes section (the next step).
          \nSpecific vehicle upgrades can be added later using "/editfac".
          \nFor a detailed list of each category you may run "/categories".
          \nYou may choose multiple vehicle services.
          \n\nThis step can be skipped or omitted if N/A.`);

        let select = new StringSelectMenuBuilder()
        .addOptions(Object.keys(services).map((category) => {
          let a = new StringSelectMenuOptionBuilder()
          .setLabel(category)
          .setValue(category);
          if (services[category].length < 2) {
            a.setDescription(category);
          } else {
            a.setDescription(services[category][0] + ", " + services[category][1] + ", " + services[category][2] + ", etc...");
          }
          return a;
          }))
        .setCustomId('service select')
        .setPlaceholder("Select your facility's vehicle services:")
        .setMaxValues(Object.keys(services).length)
        .setMinValues(1);

        let skip = new ButtonBuilder()
        .setCustomId("skip service")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Skip");

        await interaction.update({components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(skip, cancel)], embeds: [embed]});

  } else if (interaction.customId == "service select" || interaction.customId == "skip service") {
    
    if (interaction.values) {
      fac.services = interaction.values.map((element) => [element, []]);
    } else {
      fac.services = [];
    }
    

    let yes_button = new ButtonBuilder()
    .setLabel("Yes")
    .setCustomId("yes notes")
    .setStyle(ButtonStyle.Success)

    let no_button = new ButtonBuilder()
    .setLabel("No")
    .setCustomId("no notes")
    .setStyle(ButtonStyle.Danger)

    let footer = new EmbedBuilder()
    .setTitle("Would you like to write Owner's Notes for your facility?")
    .setDescription("Owner's notes are displayed at the bottom of a registration card, and are written by the owner to display additional info about their facility. Helpful notes could include usage policies and import/export details.");
  
    await interaction.update({content: "", embeds: [footer], components: [new ActionRowBuilder().addComponents(yes_button, no_button)]});

  } else if (interaction.customId == "yes notes") {
      let input = new TextInputBuilder()
        .setCustomId("notes input")
        .setLabel("Enter owner's notes:")
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(140)
        .setRequired(true);
  
      let modal = new ModalBuilder()
        .setCustomId("notes in")
        .setTitle("Notes")
  
      modal.addComponents(new ActionRowBuilder().addComponents(input));
  
      await interaction.showModal(modal);
  
      interaction.awaitModalSubmit({
        time: 60_000,
        filter: i => i.user.id === interaction.user.id,
      })
      .then(async new_int => {
        if (!new_int.isModalSubmit() || new_int.customId != "notes in") return;
        let note = new_int.fields.getTextInputValue("notes input");
        fac.notes = note;

        let yes_button = new ButtonBuilder()
        .setLabel("Yes")
        .setCustomId("yes pw")
        .setStyle(ButtonStyle.Success)

        let no_button = new ButtonBuilder()
        .setLabel("No")
        .setCustomId("no pw")
        .setStyle(ButtonStyle.Danger)

        let footer = new EmbedBuilder()
        .setTitle("Would you like to password-lock your facility?")
        .setDescription("If a password is created, users must input the password when attempting to edit it. Highly recommended as it prevents others from editing your facility!")
      
        await interaction.editReply({content: "", embeds: [footer], components: [new ActionRowBuilder().addComponents(yes_button, no_button)]});
      })
      .catch((err) => {console.log("nothing received 581")});
  } else if (interaction.customId == "no notes") {
    let yes_button = new ButtonBuilder()
        .setLabel("Yes")
        .setCustomId("yes pw")
        .setStyle(ButtonStyle.Success)

        let no_button = new ButtonBuilder()
        .setLabel("No")
        .setCustomId("no pw")
        .setStyle(ButtonStyle.Danger)

        let footer = new EmbedBuilder()
        .setTitle("Would you like to password-lock your facility?")
        .setDescription("If a password is created, users must input the password when attempting to edit it. Highly recommended as it prevents others from editing your facility!")
      
        await interaction.update({content: "", embeds: [footer], components: [new ActionRowBuilder().addComponents(yes_button, no_button)]});
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

    let row = new ActionRowBuilder().addComponents(addbutton, cancel);

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
      password: null,
      imports: null,
      exports: null,
      services: null,
      choice: null, //internal use only
      _id: null,
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