const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRow } = require('discord.js');
const storage = require("../../storage.js");
const allfacs = storage.allfacs;
const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://arthuritisyou:luoyuan1@deluge.nxwj2.mongodb.net/?retryWrites=true&w=majority&appName=Deluge";
const mongo_client = new MongoClient(uri);

const database = mongo_client.db("facilities").collection("facilities");

const data = new SlashCommandBuilder()
  .setName('editfac')
  .setDescription("Edit a pre-existing facility")
  .addIntegerOption((option) =>
    option.setName('id')
      .setDescription("Enter facility ID")
      .setRequired(true));

async function handleInteraction(interaction, fac) {
  if (interaction.customId == "confirm edit fac"
    || interaction.customId == "return to edit"
    || interaction.customId == "select secondary"
    || interaction.customId == "skip secondary"
    || interaction.customId == "new pw modal"
    || interaction.customId == "remove pw yes"
  ) {
    if (interaction.customId == "confirm edit fac" && fac.password) {
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

      let response = await interaction.awaitModalSubmit({
        time: 15000,
        filter: i => i.user.id === interaction.user.id,
      }).catch(error => {
        console.error(error);
        return null;
      })

      if (response.fields.getTextInputValue("pw input") != fac.password) {
        let footer = new EmbedBuilder()
          .setTitle("Bad password! Please restart the command and try again.");
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ components: [], embeds: storage.toEmbed(fac).concat([footer]) });
          } else {
            await interaction.update({ components: [], embeds: storage.toEmbed(fac).concat([footer]) });
          }
          
        
        return null;
      }
    }
    // await interaction.deferUpdate();
    if (interaction.customId == "select secondary") {
      let values = interaction.values;
      fac.secondary.set(values);
    }
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

    let cancel = new ButtonBuilder()
      .setCustomId("exit")
      .setLabel("Exit")
      .setStyle(ButtonStyle.Danger)
    let row = new ActionRowBuilder()
      .addComponents(contact_button, location_button, production_button, pw_button);

    let exitrow = new ActionRowBuilder()
      .addComponents(cancel);

    let header_embed = new EmbedBuilder()
    if (interaction.customId == "remove pw yes") {
      fac.password = null;
      header_embed.setTitle("Successfully removed password!")
    } else {
      header_embed.setTitle("Choose which fields you would like to edit:")
    }
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ components: [row, exitrow], embeds: storage.toEmbed(fac).concat([header_embed]) });
    } else {
      await interaction.update({ components: [row, exitrow], embeds: storage.toEmbed(fac).concat([header_embed]) });
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
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)

      row.addComponents(change_button, cancel_button);

      let footer = new EmbedBuilder()
        .setTitle("Select an operation:")
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ components: [row], embeds: storage.toEmbed(fac).concat(footer) });
      } else {
        await interaction.update({ components: [row], embeds: storage.toEmbed(fac).concat(footer) });
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

      let response = await interaction.awaitModalSubmit({
        time: 30_000,
        filter: i => i.user.id === interaction.user.id,
      })

      let answer = response.fields.getTextInputValue("new pw input");

      fac.password = answer;
      //restart interface for original editing

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

      let cancel = new ButtonBuilder()
        .setCustomId("exit")
        .setLabel("Exit")
        .setStyle(ButtonStyle.Danger)
      let row = new ActionRowBuilder()
        .addComponents(contact_button, location_button, production_button, pw_button);

      let exitrow = new ActionRowBuilder()
        .addComponents(cancel);

      let header_embed = new EmbedBuilder()
        .setTitle("Successfully added password!")
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: "", components: [row, exitrow], embeds: storage.toEmbed(fac).concat([header_embed]) });
        } else {
          await interaction.update({ content: "", components: [row, exitrow], embeds: storage.toEmbed(fac).concat([header_embed]) });
        }
      
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
        await interaction.editReply({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: storage.toEmbed(fac).concat(footer) });
      } else {
        await interaction.update({ components: [new ActionRowBuilder().addComponents(yes_button, no_button)], embeds: storage.toEmbed(fac).concat(footer) });
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
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)

    row.addComponents(change_button, cancel_button);

    let footer = new EmbedBuilder()
      .setTitle("Select an operation:")

    await interaction.update({ components: [row], embeds: storage.toEmbed(fac).concat(footer) });
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

    let response = await interaction.awaitModalSubmit({
      time: 15_000,
      filter: i => i.user.id === interaction.user.id,
    })

    let newpw = response.fields.getTextInputValue("pw input");

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
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)

    row.addComponents(change_button, cancel_button);

    let footer = new EmbedBuilder()
      .setTitle("Successfully changed password!")

    await interaction.editReply({ components: [row], embeds: storage.toEmbed(fac).concat(footer) });

  } else if (interaction.customId == "exit") {
    let footer = new EmbedBuilder()
      .setTitle("Finalized changes!")

      await database.replaceOne({id: fac.id}, fac);

    await interaction.update({ components: [], embeds: storage.toEmbed(fac).concat([footer]) });
  } else if (interaction.customId == "production" || interaction.customId == "clear primary") {
    if (interaction.customId == "clear primary") {
      fac.primary.table = [];
    }

    let primary_select = new StringSelectMenuBuilder()
      .setCustomId("select primary")
      .setPlaceholder("Select primary production items:")
      .addOptions(storage.artilleryItems.map((item) => new StringSelectMenuOptionBuilder()
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

    await interaction.update({ components: [row1, row2], embeds: storage.toEmbed(fac) });
  } else if (interaction.customId == "select primary" || interaction.customId == "skip primary" || interaction.customId == "clear secondary") {
    if (interaction.customId == "select primary") {
      let values = interaction.values;
      fac.primary.set(values);
    }

    if (interaction.customId == "clear secondary") {
      fac.secondary.table = [];
    }

    let secondary_select = new StringSelectMenuBuilder()
      .setCustomId("select secondary")
      .setPlaceholder("Select secondary production items:")
      .addOptions(storage.artilleryItems.map((item) => new StringSelectMenuOptionBuilder()
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

    await interaction.update({ components: [row1, row2], embeds: storage.toEmbed(fac) });
  }
}

module.exports = {
  data: data,
  async execute(interaction) {
    interaction.deferReply();
    let id = interaction.options.getInteger('id');
    let fac = await database.findOne({id: id});
    if (fac) { //facility found
      let embed = storage.toEmbed(fac);
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

      let response = await interaction.editReply({ content: "", components: [row], embeds: embed.concat([embed2]) });

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