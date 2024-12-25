const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
  EmbedBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const storage = require("../../storage.js");
const allfacs = storage.allfacs;
const coord = storage.coord;
const data = new SlashCommandBuilder()
  .setName('editfac')
  .setDescription("Edit a pre-existing facility")
  .addIntegerOption((option) =>
    option.setName('id')
      .setDescription("Enter facility ID")
      .setRequired(true));

async function handleInteraction(interaction, fac) {
  console.log(interaction);
  if (interaction.customId == "confirm edit fac" 
    || interaction.customId == "return to edit"
    || interaction.customId == "select secondary"
    || interaction.customId == "skip secondary"
  ) {
    if (interaction.customId == "select secondary") {
      let values = interaction.values;
      fac.secondary.table = values;
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

    let cancel = new ButtonBuilder()
    .setCustomId("exit")
    .setLabel("Exit")
    .setStyle(ButtonStyle.Danger)
    let row = new ActionRowBuilder()
    .addComponents(contact_button, location_button, production_button, cancel);

    let header_embed = new EmbedBuilder()
    .setTitle("Choose which fields you would like to edit:")

    await interaction.update({content: "", components: [row], embeds: fac.toEmbed().concat([header_embed])});

  } else if (interaction.customId == "exit") {
    let footer = new EmbedBuilder()
    .setTitle("Finalized changes!")

    await interaction.update({components: [], embeds: fac.toEmbed().concat([footer])});
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

    await interaction.update({components: [row1, row2], embeds: fac.toEmbed()});
  } else if (interaction.customId == "select primary" || interaction.customId == "skip primary" || interaction.customId == "clear secondary") {
    if (interaction.customId == "select primary") {
      let values = interaction.values;
      fac.primary.table = values;
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

    await interaction.update({components: [row1, row2], embeds: fac.toEmbed()});
  }
}

module.exports = {
  data: data,
  async execute(interaction) {
    let id = interaction.options.getInteger('id');
    let fac = allfacs.facility_id_tracker[id];
    if (fac) { //facility found
      let embed = fac.toEmbed();
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

      let response = await interaction.reply({ content: "", components: [row], embeds: embed.concat([embed2]) });

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