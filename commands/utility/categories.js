const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {items, services} = require("../../storage.js");

const data = new SlashCommandBuilder()
  .setName("categories")
  .setDescription("Display information about production categories and services")

let embed = new EmbedBuilder()
.setTitle("Categories")
.setDescription("Production categories can be divided into either **item categories** or **services**. Item categories are used for import/export selections while services are used for vehicle services about a facility.")

let itemEmbed = new EmbedBuilder()
.setTitle("Production Items")
.addFields(Object.keys(items).map((element) => {
    let str = "";
    for (let item in items[element]) {
        if (item == items[element].length - 1) {
            str = str + items[element][item];
        } else {
            str = str + items[element][item] + ", ";
        }
    }
    return {name: element, value: str}
}));

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.reply({embeds: [embed, itemEmbed]});

    }
}
