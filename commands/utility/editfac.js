const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events, } = require('discord.js');
const { client, database, hexes1, hexes1only, hexes2, hexes2only, toEmbed, letter_map, number_map, items, services } = require("../../storage.js");

let fac_arr = []; //stores id's of facilities being currently edited; IDs will be released once a command is finished

const data = new SlashCommandBuilder()
  .setName('editfac')
  .setDescription("Edit a pre-existing facility")
  .addIntegerOption((option) =>
    option.setName('id')
      .setDescription("Enter facility ID")
      .setRequired(true));

async function returnHomeMenu(interaction, fac, msg) {
  let contact_button = new ButtonBuilder()
    .setCustomId("contact")
    .setLabel("Edit Contact Info")
    .setStyle(ButtonStyle.Primary)

  let location_button = new ButtonBuilder()
    .setCustomId("location")
    .setLabel("Edit Location Info")
    .setStyle(ButtonStyle.Primary)

  let pw_button = new ButtonBuilder()
    .setCustomId("change pw init")
    .setLabel("Set/Edit Password")
    .setStyle(ButtonStyle.Primary);

  let notes_button = new ButtonBuilder()
    .setCustomId("notes")
    .setLabel("Edit Owner's Notes")
    .setStyle(ButtonStyle.Primary);

  let cancel = new ButtonBuilder()
    .setCustomId("save")
    .setLabel("Save/Exit")
    .setStyle(ButtonStyle.Success);

  let imports_button = new ButtonBuilder()
    .setCustomId("imports")
    .setLabel("Edit Imports Info")
    .setStyle(ButtonStyle.Secondary);

  let exports_button = new ButtonBuilder()
    .setCustomId("exports")
    .setLabel("Edit Exports Info")
    .setStyle(ButtonStyle.Secondary);

  let services_button = new ButtonBuilder()
    .setCustomId("services")
    .setLabel("Edit Services Info")
    .setStyle(ButtonStyle.Secondary);

  let del = new ButtonBuilder()
    .setCustomId("delete")
    .setLabel("Delete Facility")
    .setStyle(ButtonStyle.Danger)

  let row = new ActionRowBuilder()
    .addComponents(contact_button, location_button, pw_button, notes_button);

  let production_row = new ActionRowBuilder().addComponents(imports_button, exports_button, services_button);

  let exitrow = new ActionRowBuilder()
    .addComponents(cancel, del);

  let header_embed = new EmbedBuilder()
  header_embed.setTitle(msg);
  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({ components: [row, production_row, exitrow], embeds: toEmbed(fac).concat([header_embed]) });
  } else {
    await interaction.update({ components: [row, production_row, exitrow], embeds: toEmbed(fac).concat([header_embed]) });
  }
}

async function returnProductionMenu(interaction, fac, selection, msg) {
  let upper = selection.charAt(0).toUpperCase() + selection.substring(1).slice(0, -1);
  let add_specific = new ButtonBuilder()
  .setCustomId("add " + selection)
  .setLabel("Edit " + upper + " Items")
  .setStyle(ButtonStyle.Primary)

  let change = new ButtonBuilder()
  .setCustomId("change " + selection)
  .setLabel("Edit " + upper + " Categories")
  .setStyle(ButtonStyle.Primary);

  if (fac[selection].length <= 1) {
    add_specific.setCustomId("add items " + selection);
    if (fac[selection].length == 0) {
      change.setCustomId("add cate " + selection);
    } else {
      fac.choice = fac[selection][0][0];
      console.log("set fac choice");
    }
  }

  let back = new ButtonBuilder()
  .setCustomId("return to edit")
  .setLabel("Back")
  .setStyle(ButtonStyle.Secondary);

  let footer = new EmbedBuilder()
  .setTitle(msg);

  let row = new ActionRowBuilder();
  if (fac[selection].length > 0) {
    row.addComponents(add_specific, change, back);
  } else {
    row.addComponents(change, back);
  }

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({
      components: [row],
      embeds: toEmbed(fac).concat([footer])
    })
  } else {
    await interaction.update({
      components: [row],
      embeds: toEmbed(fac).concat([footer])
    })
  }
  
}

async function handleInteraction(interaction, fac) {
  if (interaction.customId == "confirm edit fac") {
    if (fac.password) {
      let pwattempt = new TextInputBuilder()
        .setCustomId("pw input")
        .setLabel("Input the facility password:")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(4)
        .setMaxLength(8)

      let modal = new ModalBuilder()
        .setCustomId("pw attempt")
        .setTitle("Password")
        .addComponents(new ActionRowBuilder().addComponents(pwattempt));

      await interaction.showModal(modal);

      client.once(Events.InteractionCreate, async new_int => {
        if (!new_int.isModalSubmit() || new_int.customId != "pw attempt") return;
        if (new_int.fields.getTextInputValue("pw input") != fac.password) {
          let footer = new EmbedBuilder()
            .setTitle("Bad password! Please restart the command and try again.");
          if (fac_arr.indexOf(fac.id) >= 0) {
            fac_arr.splice(fac_arr.indexOf(fac.id), 1);
            console.log("removed id " + fac.id + " from fac array");
          }
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ components: [], embeds: toEmbed(fac).concat([footer]) });
          } else {
            await interaction.update({ components: [], embeds: toEmbed(fac).concat([footer]) });
          }
        } else {
          await returnHomeMenu(interaction, fac, "Choose which fields you would like to edit:");
        }
      })
    } else {
      await returnHomeMenu(interaction, fac, "Choose which fields you would like to edit:");
    }

  } else if (interaction.customId == "return to edit"
    || interaction.customId == "select secondary"
    || interaction.customId == "skip secondary"
    || interaction.customId == "new pw modal"
    || interaction.customId == "remove pw yes"
    || interaction.customId == "del no"
  ) {

    // await interaction.deferUpdate();
    
    if (interaction.customId == "remove pw yes") {
      fac.password = null;
      await returnHomeMenu(interaction, fac, "Successfully removed password! Remember to save and exit when finished.");
    } else {
      await returnHomeMenu(interaction, fac, "Choose which fields you would like to edit:");
    }
  } else if (interaction.customId == "reject edit fac") {
    interaction.update({ content: "Interaction cancelled!", components: [], embeds: [] });

  } else if (interaction.customId == "contact") {
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

    client.once(Events.InteractionCreate, async new_int => {
      if (!new_int.isModalSubmit() || new_int.customId != "regiment modal") return;
      fac.regiment = new_int.fields.getTextInputValue("regiment");
      fac.contact = new_int.fields.getTextInputValue("contact");
      fac.nickname = new_int.fields.getTextInputValue("nickname");

      await returnHomeMenu(interaction, fac, "Successfully changed contact info! Remember to save and exit when finished.");
    })
  } else if (interaction.customId == "notes") {
    let input = new TextInputBuilder()
      .setCustomId("notes input")
      .setLabel("Enter owner's notes (leave blank to clear):")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(140)
      .setRequired(false);

    let modal = new ModalBuilder()
      .setCustomId("notes in")
      .setTitle("Notes")

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);

    client.once(Events.InteractionCreate, async new_int => {
      if (!new_int.isModalSubmit() || new_int.customId != "notes in") return;
      let note = new_int.fields.getTextInputValue("notes input");
      fac.notes = note;
      await returnHomeMenu(interaction, fac, "Edited owner's notes!");
    })

    // returnHomeMenu(interaction, fac, "Failed to edit owner's notes: no changes were made.");


  } else if (interaction.customId == "location" || interaction.customId == "switch page 1") {
    let footer = new EmbedBuilder()
    .setTitle("Select hex")
    .setDescription("Select the hex your facility is built in.\nMost Northern hexes are on the first page. Most Southern hexes are on the second page.");

    let select = new StringSelectMenuBuilder()
      .setCustomId('hex select')
      .setPlaceholder('Select hex of your facility (page 1/2):')
      .addOptions(hexes1only.map((hex) => new StringSelectMenuOptionBuilder()
        .setLabel(hex)
        .setDescription(hex)
        .setValue(hex)
      ));

      let other_page = new ButtonBuilder()
      .setCustomId("switch page 2")
      .setLabel("Switch Page")
      .setStyle(ButtonStyle.Secondary);
      

    let row = new ActionRowBuilder().addComponents(select);
    let buttonrow = new ActionRowBuilder().addComponents(other_page);

    await interaction.update({
      content: "",
      components: [row, buttonrow],
      embeds: [footer],
    });

    //Paste coordinates
  } else if (interaction.customId == "switch page 2") { //Switch to page 2
    let footer = new EmbedBuilder()
    .setTitle("Select hex")
    .setDescription("Select the hex your facility is built in.\nMost Northern hexes are on the first page. Most Southern hexes are on the second page.");

    let select = new StringSelectMenuBuilder()
    .setCustomId('hex select')
    .setPlaceholder('Select hex of your facility (page 2/2):')
      .addOptions(hexes2only.map(hex => new StringSelectMenuOptionBuilder()
        .setLabel(hex)
        .setDescription(hex)
        .setValue(hex)
      )
      );
      let other_page = new ButtonBuilder()
      .setCustomId("switch page 1")
      .setLabel("Switch Page")
      .setStyle(ButtonStyle.Secondary);

    row = new ActionRowBuilder().addComponents(select);
    buttonrow = new ActionRowBuilder().addComponents(other_page);

     await interaction.update({
      content: "",
      components: [row, buttonrow],
      embeds: [footer],
    });

  } else if (interaction.customId == "cancel") {
    await interaction.update({
      content: 'Interaction cancelled!',
      components: [],
    });

    //Selection made for hex, string select
  } else if (interaction.customId == "hex select") {
    fac.hex = interaction.values[0];

    let chunk = JSON.parse(JSON.stringify(hexes1.find((chunk) => chunk[0] == fac.hex) ?? hexes2.find((chunk) => chunk[0] == fac.hex)));
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
    await interaction.update({
      components: [row],
      embeds: [footer]
    });

    //Selection made for town
  }  else if (interaction.customId == "town select") {
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

    let footer = new EmbedBuilder()
      .setTitle("Select grid letter")
      .setDescription("Select the grid letter of your facility's coordinates. Eg. 'A' in A6, 'D' in D12, etc.");

    row = new ActionRowBuilder().addComponents(select);
    await interaction.update({
      components: [row],
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
      .setPlaceholder('Select the grid number of your location:');

    let footer = new EmbedBuilder()
      .setTitle("Select grid number")
      .setDescription("Select the grid number of your facility's coordinates. Eg. '6' in A6, '12' in D12, etc.");

    row = new ActionRowBuilder().addComponents(select);
    await interaction.update({
      components: [row],
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

    let footer = new EmbedBuilder()
      .setTitle("Select field placement")
      .setDescription("Specify if your facility is built near a resource field.");
    await interaction.update({
      components: [row],
      embeds: [footer]
    });

    //Final step in adding a facility
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
        .setPlaceholder("Where is the relative location of your facility?");

      let footer = new EmbedBuilder()
        .setTitle("Select relative location")
        .setDescription("Using cardinal directions, specify where your facility is in reference to your town's TH or relic.");
      let row = new ActionRowBuilder().addComponents(select);
      await interaction.update({
        components: [row],
        embeds: [footer]
      });

    } else {
      if (interaction.customId == "field select") {
        fac.field = interaction.values[0];
        fac.relative = null;
      } else {
        fac.relative = interaction.values[0];
        fac.field = null;
      }

      returnHomeMenu(interaction, fac, "Successfully changed location! Remember to save and exit when finished.");
    }
  } else if (interaction.customId == "change pw init") { //jesus christ this whole thing is cancer
    if (fac.password) {
      await interaction.deferUpdate();
      let row = new ActionRowBuilder()
      let remove_button = new ButtonBuilder()
        .setCustomId("remove pw")
        .setLabel("Remove Password")
        .setStyle(ButtonStyle.Danger);
      row.addComponents(remove_button);

      let change_button = new ButtonBuilder()
        .setCustomId("change pw")
        .setLabel("Change Password")
        .setStyle(ButtonStyle.Primary)

      let cancel_button = new ButtonBuilder()
        .setCustomId("return to edit")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)

      row.addComponents(change_button, cancel_button);

      let footer = new EmbedBuilder()
        .setTitle("Select an operation:")
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ components: [row], embeds: toEmbed(fac).concat(footer) });
      } else {
        await interaction.update({ components: [row], embeds: toEmbed(fac).concat(footer) });
      }
    } else { //no password- add one
      let input = new TextInputBuilder()
        .setCustomId("new pw input")
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

      client.once(Events.InteractionCreate, async new_int => {
        if (!new_int.isModalSubmit() || new_int.customId != "new pw modal") return;
        let answer = new_int.fields.getTextInputValue("new pw input");
        fac.password = answer;
        await returnHomeMenu(interaction, fac, "Successfully added password!");
      })

    }
  } else if (interaction.customId == "delete") {
    await interaction.deferUpdate();
    let yes_button = new ButtonBuilder()
      .setCustomId("del yes")
      .setLabel("Yes")
      .setStyle(ButtonStyle.Success);

    let no_button = new ButtonBuilder()
      .setCustomId("del no")
      .setLabel("No")
      .setStyle(ButtonStyle.Danger);

    let footer = new EmbedBuilder()
      .setTitle("Are you sure you want to delete this facility registration? This can't be undone.")
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: toEmbed(fac).concat(footer) });
    } else {
      await interaction.update({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: toEmbed(fac).concat(footer) });
    }
  } else if (interaction.customId == "remove pw") {
    await interaction.deferUpdate();
    let yes_button = new ButtonBuilder()
      .setCustomId("remove pw yes")
      .setLabel("Yes")
      .setStyle(ButtonStyle.Success);

    let no_button = new ButtonBuilder()
      .setCustomId("remove pw no")
      .setLabel("No")
      .setStyle(ButtonStyle.Danger);

    let footer = new EmbedBuilder()
      .setTitle("Are you sure you want to remove your password?")
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: toEmbed(fac).concat(footer) });
    } else {
      await interaction.update({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: toEmbed(fac).concat(footer) });
    }
  } else if (interaction.customId == "del yes") {
    await interaction.deferUpdate();
    let result = await database.deleteOne({ id: fac.id });
    if (result.acknowledged && result.deletedCount == 1) {
      let footer = new EmbedBuilder()
        .setTitle("Facility registration deleted!")

      await interaction.editReply({ components: [], embeds: [footer] });
    } else {
      let footer = new EmbedBuilder()
        .setTitle("Delete command failed, please re-run the command.");
      if (!result.acknowledged) {
        footer.setDescription("*Debugging only: deleteOne failed to acknowledge*");
      } else {
        footer.setDescription("*Debugging only: deleteOne failed to delete a document*");
      }
      await interaction.editReply({ components: [], embeds: [footer] });
    }

  } else if (interaction.customId == "remove pw no") {
    await interaction.deferUpdate();
    if (interaction.customId == "remove pw yes") {
      fac.password = null;
    }

    let row = new ActionRowBuilder()
    if (fac.password) {
      let remove_button = new ButtonBuilder()
        .setCustomId("remove pw")
        .setLabel("Remove Password")
        .setStyle(ButtonStyle.Danger);
      row.addComponents(remove_button);
    }

    let change_button = new ButtonBuilder()
      .setCustomId("change pw")
      .setLabel("Change Password")
      .setStyle(ButtonStyle.Primary)

    let cancel_button = new ButtonBuilder()
      .setCustomId("return to edit")
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary)

    row.addComponents(change_button, cancel_button);

    let footer = new EmbedBuilder()
      .setTitle("Select an operation:")

    await interaction.editReply({ components: [row], embeds: toEmbed(fac).concat(footer) });
  } else if (interaction.customId == "change pw") {
    let input = new TextInputBuilder()
      .setCustomId("pw input")
      .setLabel("Enter a new password (4-8 characters):")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(8)
      .setMinLength(4)

    let modal = new ModalBuilder()
      .setCustomId("change pw modal")
      .setTitle("Password")

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);

    client.once(Events.InteractionCreate, async new_int => {
      if (!new_int.isModalSubmit() || new_int.customId != "change pw modal") return;
      let newpw = new_int.fields.getTextInputValue("pw input");
      fac.password = newpw;

      let row = new ActionRowBuilder()
      let remove_button = new ButtonBuilder()
        .setCustomId("remove pw")
        .setLabel("Remove Password")
        .setStyle(ButtonStyle.Danger);
      row.addComponents(remove_button);

      let change_button = new ButtonBuilder()
        .setCustomId("change pw")
        .setLabel("Change Password")
        .setStyle(ButtonStyle.Primary)

      let cancel_button = new ButtonBuilder()
        .setCustomId("return to edit")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)

      row.addComponents(change_button, cancel_button);

      let footer = new EmbedBuilder()
        .setTitle("Successfully changed password! Remember to save and exit when finished.")

      await interaction.editReply({ components: [row], embeds: toEmbed(fac).concat(footer) });

    })


  } else if (interaction.customId == "save") {
    let footer = new EmbedBuilder()
      .setTitle("Finalized changes!")

    fac.last = Math.floor(Date.now()/1000);
    await database.replaceOne({ id: fac.id }, fac);

    if (fac_arr.indexOf(fac.id) >= 0) {
      fac_arr.splice(fac_arr.indexOf(fac.id), 1);
      console.log("removed id " + fac.id + " from fac array");
    }

    await interaction.update({ components: [], embeds: toEmbed(fac).concat([footer]) });
  } else if (interaction.customId == "imports" || interaction.customId == "exports" || interaction.customId == "services") {
    await returnProductionMenu(interaction, fac, interaction.customId, "Select your action:");

  } else if (interaction.customId == "add imports" || interaction.customId == "add exports" || interaction.customId == "add services") {
    let lower = interaction.customId.substring(4).toLowerCase();
    let select = new StringSelectMenuBuilder()
    .addOptions(fac[lower].map((slice) => 
      new StringSelectMenuOptionBuilder()
          .setLabel(slice.category)
          .setDescription(slice.category)
          .setValue(slice.category)
    ))
    .setCustomId("select " + lower)
    .setPlaceholder("Select which " + lower.slice(0, -1) + " category to edit:");

    let back = new ButtonBuilder()
    .setCustomId(interaction.customId.substring(4))
    .setLabel("Back")
    .setStyle(ButtonStyle.Secondary);

    let footer = new EmbedBuilder()
    .setTitle("Select which " + lower.slice(0, -1) + " category to edit:");

    await interaction.update({
      components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(back)],
      embeds: toEmbed(fac).concat([footer])
    })
  } else if (interaction.customId == "select imports" || interaction.customId == "select exports" || interaction.customId == "select services"
    || interaction.customId == "back   imports" || interaction.customId == "back   exports" || interaction.customId == "back   services"
  ) {
    let choice = fac.choice; //category
    let row = new ActionRowBuilder()
    if (interaction.customId.substring(0, 6) == "select" && interaction.values) {
      choice = interaction.values[0];
      fac.choice = choice;
    }
    let lower = interaction.customId.substring(7);

    let remove = new ButtonBuilder()
    .setCustomId("remove items " + lower)
    .setLabel("Remove Items")
    .setStyle(ButtonStyle.Danger);

    let add = new ButtonBuilder()
    .setCustomId("add items " + lower)
    .setLabel("Add Items")
    .setStyle(ButtonStyle.Success);

    let back = new ButtonBuilder()
      .setCustomId("add " + lower)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    if (fac[lower].length <= 1) {
      back.setCustomId(lower);
    }

    let footer = new EmbedBuilder()
    .setTitle("Select your action:")

    if (fac[lower].find((element) => element.category == choice).arr.length > 0) {
      row.addComponents(add, remove, back);

      await interaction.update({
        components: [row],
        embeds: toEmbed(fac).concat([footer])
      })
    } else {
      interaction.customId = "add items " + lower;
      await handleInteraction(interaction, fac);
      // row.addComponents(add, back);
    }
  } else if (interaction.customId == "add items imports" || interaction.customId == "add items exports" || interaction.customId == "add items services") {
    let lower = interaction.customId.substring(10);
    let current = fac[lower].find((element) => element.category == fac.choice).arr.map((element) => element.name);
    let db = lower == "imports" || lower == "exports" ? items : services;
    let new_choices = structuredClone(db[fac.choice]);

    for (let ele of current) {
      let ind = new_choices.indexOf(ele);
      if (ind >= 0) {
        new_choices.splice(ind, 1);
      }
    }

    let back = new ButtonBuilder()
      .setCustomId("back   " + lower)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    let select = new StringSelectMenuBuilder()
    .addOptions(new_choices.map((item) => 
      new StringSelectMenuOptionBuilder()
          .setLabel(item)
          .setDescription(item)
          .setValue(item)
    ))
    .setCustomId("add select " + lower)
    .setPlaceholder("Add " + fac.choice + " items:")
    .setMinValues(1)
    .setMaxValues(new_choices.length);

    let footer = new EmbedBuilder()
    .setTitle("Add " + fac.choice + " items.")
    .setDescription("You may choose up to " + new_choices.length + " items to add.");

    await interaction.update({components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(back)], embeds: toEmbed(fac).concat([footer])});
  
  } else if (interaction.customId == "add select imports" || interaction.customId == "add select exports" || interaction.customId == "add select services") {
    let choices = interaction.values;
    let lower = interaction.customId.substring(11);
    let ind = fac[lower].findIndex((element) => element.category == fac.choice);
    fac[lower][ind].arr = fac[lower][ind].arr
    .concat(choices.map((item) => {
      return {
        name: item,
        stock: 0,
        date: Math.floor(Date.now()/1000)
      }
    }));

    await returnProductionMenu(interaction, fac, lower, 
      "Successfully edited " + fac.choice + " " + lower.slice(0, -1) + " items! Remember to save and exit when finished.");
      if (fac[lower].length > 1) {
        fac.choice = null;
      }

  } else if (interaction.customId == "remove items imports" || interaction.customId == "remove items exports" || interaction.customId == "remove items services") {
    let lower = interaction.customId.substring(13);
    let current = fac[lower].find((element) => element.category == fac.choice).arr.map((element) => element.name);
    console.log(current);
   
    let back = new ButtonBuilder()
      .setCustomId("back   " + lower)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    let select = new StringSelectMenuBuilder()
    .addOptions(current.map((item) => 
      new StringSelectMenuOptionBuilder()
          .setLabel(item)
          .setDescription(item)
          .setValue(item)
    ))
    .setCustomId("remove select " + lower)
    .setPlaceholder("Remove " + fac.choice + " items:")
    .setMinValues(1)
    .setMaxValues(current.length);

    let footer = new EmbedBuilder()
    .setTitle("Remove " + fac.choice + " items.")
    .setDescription("You may choose up to " + current.length + " items to remove.");

    await interaction.update({components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(back)], embeds: toEmbed(fac).concat([footer])});
  
  } else if (interaction.customId == "remove select imports" || interaction.customId == "remove select exports" || interaction.customId == "remove select services") {
    let choices = interaction.values;
    let lower = interaction.customId.substring(14);

    let ind = fac[lower].findIndex((element) => element.category == fac.choice);
    
    for (let ele of choices) {
      let ind2 = fac[lower][ind].arr.findIndex((element) => element.name == ele);
      if (ind2 >= 0) {
        fac[lower][ind].arr.splice(ind2, 1);
      }
    }

    await returnProductionMenu(interaction, fac, lower, 
      "Successfully removed " + choices.length + " items! Remember to save and exit when finished.");

      fac.choice = null;
  }
  
  else if (interaction.customId == "change imports" || interaction.customId == "change exports" || interaction.customId == "change services") 
   {
    let lower = interaction.customId.substring(7);
    
    let remove = new ButtonBuilder()
    .setCustomId("remove cate " + lower)
    .setLabel("Remove Categories")
    .setStyle(ButtonStyle.Danger);

    let add = new ButtonBuilder()
    .setCustomId("add cate " + lower)
    .setLabel("Add Categories")
    .setStyle(ButtonStyle.Success);

    let back = new ButtonBuilder()
      .setCustomId(lower)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    let footer = new EmbedBuilder()
    .setTitle("Select your action:")

    await interaction.update({
      components: [new ActionRowBuilder().addComponents(add, remove, back)],
      embeds: toEmbed(fac).concat([footer])
    })

  } else if (interaction.customId == "add cate imports" || interaction.customId == "add cate exports" || interaction.customId == "add cate services") {
    let lower = interaction.customId.substring(9);
    let db = lower == "imports" || lower == "exports" ? items : services;
    let current = fac[lower].map((element) => element.category);
    let new_choices = Object.keys(db);

    for (let ele of current) {
      let ind = new_choices.indexOf(ele);
      if (ind >= 0) {
        new_choices.splice(ind, 1);
      }
    }
    let back = new ButtonBuilder()
    .setCustomId("change " + lower)
    .setLabel("Back")
    .setStyle(ButtonStyle.Secondary);

    if (fac[lower].length <= 1) {
      back.setCustomId(lower);
    }

    let select = new StringSelectMenuBuilder()
    .addOptions(new_choices.map((item) => 
      new StringSelectMenuOptionBuilder()
          .setLabel(item)
          .setDescription(item)
          .setValue(item)
    ))
    .setCustomId("add select cate " + lower)
    .setPlaceholder("Select new " + lower.slice(0, -1) + " categories:")
    .setMinValues(1)
    .setMaxValues(new_choices.length);

    let footer = new EmbedBuilder()
    .setTitle("Select new " + lower.slice(0, -1) + " categories.")
    .setDescription("You may choose up to " + new_choices.length + " options.");

    await interaction.update({
      components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(back)],
      embeds: toEmbed(fac).concat([footer])
    })
  
  
  } else if (interaction.customId == "add select cate imports" || interaction.customId == "add select cate exports" || interaction.customId == "add select cate services") {
    let choices = interaction.values;
    let lower = interaction.customId.substring(16);
    fac[lower] = fac[lower].concat(choices.map((element) => {
      return {
        category: element,
        arr: []
      }
    }));

    await returnProductionMenu(interaction, fac, lower, "Successfully added " + choices.length + " categories! Remember to save and exit when finished.");
  
  } else if (interaction.customId == "remove cate imports" || interaction.customId == "remove cate exports" || interaction.customId == "remove cate services") {
    let lower = interaction.customId.substring(12);
    let current = fac[lower].map((element) => element.category);
   
    let back = new ButtonBuilder()
      .setCustomId(lower)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    let select = new StringSelectMenuBuilder()
    .addOptions(current.map((item) => 
      new StringSelectMenuOptionBuilder()
          .setLabel(item)
          .setDescription(item)
          .setValue(item)
    ))
    .setCustomId("remove select cate " + lower)
    .setPlaceholder("Remove " + lower.slice(0, -1) + " categories:")
    .setMinValues(1)
    .setMaxValues(current.length);

    let footer = new EmbedBuilder()
    .setTitle("Remove " + lower.slice(0, -1) + " items.")
    .setDescription("You may choose up to " + current.length + " categories to remove.");

    await interaction.update({components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(back)], embeds: toEmbed(fac).concat([footer])});
  
  } else if (interaction.customId == "remove select cate imports" || interaction.customId == "remove select cate exports" || interaction.customId == "remove select cate services") {
    let choices = interaction.values;
    let lower = interaction.customId.substring(19);
    
    for (let ele of choices) {
      let ind2 = fac[lower].findIndex((element) => element.category == ele);
      if (ind2 >= 0) {
        fac[lower].splice(ind2, 1);
      }
    }

    await returnProductionMenu(interaction, fac, lower, 
      "Successfully removed " + choices.length + " categories! Remember to save and exit when finished.");

  }
}

module.exports = {
  data: data,
  async execute(interaction) {
    await interaction.deferReply();
    let id = interaction.options.getInteger('id');
    let fac = await database.findOne({ id: id });
    if (fac) { //facility found
      if (fac_arr.indexOf(id) == -1) {
        fac_arr.push(id);
        let embed = toEmbed(fac);
        let yes = new ButtonBuilder()
          .setCustomId('confirm edit fac')
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success);
  
        let no = new ButtonBuilder()
          .setCustomId("reject edit fac")
          .setLabel("No")
          .setStyle(ButtonStyle.Danger);
  
        let row = new ActionRowBuilder()
          .addComponents(yes, no);
  
        let embed2 = new EmbedBuilder()
          .setTitle("Is this the facility you want to edit?");
  
        let response = await interaction.followUp({ content: "", components: [row], embeds: embed.concat([embed2]) });
  
        let buttoncollector = response.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60_000,
          filter: i => i.user.id === interaction.user.id,
        })
        buttoncollector.on('collect', async i2 => {
          buttoncollector.resetTimer();
          stringcollector.resetTimer();
          handleInteraction(i2, fac);
        });
  
        let stringcollector = response.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60_000,
          filter: i => i.user.id === interaction.user.id,
        })
        
        stringcollector.on('collect', async i2 => {
          stringcollector.resetTimer();
          buttoncollector.resetTimer();
          handleInteraction(i2, fac);
        });

        stringcollector.on("end", async e => {
          if (fac_arr.indexOf(id) >= 0) {
            fac_arr.splice(fac_arr.indexOf(id), 1);
          }
          interaction.followUp("Interaction closed: a response was not received within one minute!")
        });
      } else {
        await interaction.followUp("There is currently an active /editfac command that must be finished first!");
      }
      

    } else { //facility not found
      let embed = new EmbedBuilder()
        .setTitle("Facility with id " + id + " could not be found!");
      interaction.reply({ content: "", embeds: [embed] });
    }
  }
}
