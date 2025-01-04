const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events, } = require('discord.js');
const { client, hexes1, hexes1only, toEmbed, artilleryItems, letter_map, number_map } = require("../../storage.js");
const { MongoClient } = require("mongodb");
const { uri } = require("../../sensitive.js");
const mongo_client = new MongoClient(uri);

const database = mongo_client.db("facilities").collection("facilities");

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

  let production_button = new ButtonBuilder()
    .setCustomId("production")
    .setLabel("Edit Production Info")
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

  let del = new ButtonBuilder()
    .setCustomId("delete")
    .setLabel("Delete Facility")
    .setStyle(ButtonStyle.Danger)

  let row = new ActionRowBuilder()
    .addComponents(contact_button, location_button, production_button, pw_button, notes_button);

  let exitrow = new ActionRowBuilder()
    .addComponents(cancel, del);

  let header_embed = new EmbedBuilder()
  header_embed.setTitle(msg);
  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({ components: [row, exitrow], embeds: toEmbed(fac).concat([header_embed]) });
  } else {
    await interaction.update({ components: [row, exitrow], embeds: toEmbed(fac).concat([header_embed]) });
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
    if (interaction.customId == "select secondary") {
      let values = interaction.values;
      fac.secondary = [];
      for (let val of values) {
        fac.secondary.push([val, 0, Math.floor(Date.now() / 1000)]);
      }
    }
    if (interaction.customId == "remove pw yes") {
      fac.password = null;
      await returnHomeMenu(interaction, fac, "Successfully removed password!");
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
  
        await returnHomeMenu(interaction, fac, "Successfully changed contact info!");
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

  
} else if (interaction.customId == "location") {
  let select = new StringSelectMenuBuilder()
    .setCustomId('hex select')
    .setPlaceholder('Select hex of your facility:')
    .addOptions(hexes1only.map((hex) => new StringSelectMenuOptionBuilder()
      .setLabel(hex)
      .setDescription(hex)
      .setValue(hex)
    ));

  let row = new ActionRowBuilder().addComponents(select);
  // let buttonrow = new ActionRowBuilder().addComponents(other_page, cancel);

  await interaction.update({
    content: 'Choose your facility hex:',
    components: [row],
    embeds: [],
  });
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

  row = new ActionRowBuilder().addComponents(select);
  await interaction.update({
    content: 'Select hex town:',
    components: [row],
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
  await interaction.update({
    content: 'Select grid letter:',
    components: [row],
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
  await interaction.update({
    content: 'Select grid number:',
    components: [row],
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
  await interaction.update({
    content: 'Select field type:',
    components: [row],
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
      .setPlaceholder("Where is the relative location of your facility?")
    let row = new ActionRowBuilder().addComponents(select);
    await interaction.update({
      content: 'Select relative location:',
      components: [row],
    });

  } else {
    if (interaction.customId == "field select") {
      fac.field = interaction.values[0];
      fac.relative = null;
    } else {
      fac.relative = interaction.values[0];
      fac.field = null;
    }

    returnHomeMenu(interaction, fac, "Successfully changed location!");
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
      .setTitle("Successfully changed password!")

    await interaction.editReply({ components: [row], embeds: toEmbed(fac).concat(footer) });

  })


} else if (interaction.customId == "save") {
  let footer = new EmbedBuilder()
    .setTitle("Finalized changes!")

  await database.replaceOne({ id: fac.id }, fac);

  await interaction.update({ components: [], embeds: toEmbed(fac).concat([footer]) });
} else if (interaction.customId == "production" || interaction.customId == "clear primary") {
  if (interaction.customId == "clear primary") {
    fac.primary = [];
  }

  let primary_select = new StringSelectMenuBuilder()
    .setCustomId("select primary")
    .setPlaceholder("Select primary production items:")
    .addOptions(artilleryItems.map((item) => new StringSelectMenuOptionBuilder()
      .setLabel(item)
      .setDescription(item)
      .setValue(item)
    ))
    .setMinValues(1)
    .setMaxValues(3)

  let skip = new ButtonBuilder()
    .setCustomId("skip primary")
    .setLabel("Skip")
    .setStyle(ButtonStyle.Primary);

  let clear = new ButtonBuilder()
    .setCustomId("clear primary")
    .setLabel("Clear Options")
    .setStyle(ButtonStyle.Secondary);

  let row1 = new ActionRowBuilder()
    .addComponents(primary_select)

  let row2 = new ActionRowBuilder()
    .addComponents(clear, skip)

  await interaction.update({ components: [row1, row2], embeds: toEmbed(fac) });
} else if (interaction.customId == "select primary" || interaction.customId == "skip primary" || interaction.customId == "clear secondary") {
  if (interaction.customId == "select primary") {
    let values = interaction.values;
    fac.primary = [];
    for (let val of values) {
      fac.primary.push([val, 0, Math.floor(Date.now() / 1000)]);
    }
  }

  if (interaction.customId == "clear secondary") {
    fac.secondary = [];
  }

  let secondary_select = new StringSelectMenuBuilder()
    .setCustomId("select secondary")
    .setPlaceholder("Select secondary production items:")
    .addOptions(artilleryItems.map((item) => new StringSelectMenuOptionBuilder()
      .setLabel(item)
      .setDescription(item)
      .setValue(item)
    ))
    .setMinValues(1)
    .setMaxValues(3)

  let skip = new ButtonBuilder()
    .setCustomId("skip secondary")
    .setLabel("Skip")
    .setStyle(ButtonStyle.Primary);

  let clear = new ButtonBuilder()
    .setCustomId("clear secondary")
    .setLabel("Clear Options")
    .setStyle(ButtonStyle.Secondary);

  let row1 = new ActionRowBuilder()
    .addComponents(secondary_select)

  let row2 = new ActionRowBuilder()
    .addComponents(clear, skip)

  await interaction.update({ components: [row1, row2], embeds: toEmbed(fac) });
}
}

module.exports = {
  data: data,
  async execute(interaction) {
    await interaction.deferReply();
    let id = interaction.options.getInteger('id');
    let fac = await database.findOne({ id: id });
    if (fac) { //facility found
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

    } else { //facility not found
      let embed = new EmbedBuilder()
        .setTitle("Facility with id " + id + " could not be found!");
      interaction.reply({ content: "", embeds: [embed] });
    }
  }
}
