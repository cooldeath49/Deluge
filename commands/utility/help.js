const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Display help information about Deluge")

let embed = new EmbedBuilder()
.setTitle("Help")
.setDescription("Welcome to the Deluge bot, a registry bot that lets Wardens better coordinate artillery distribution! You may find logged facilities here, detailed with their coordinates, production information, and more.\nTo get started, check out the commands below.")
.addFields(
    {
        name: "/listfac (OPTIONAL hex)", value: "Lists registered facilities across all hexes and towns. Optionally, you may list facilities within only a specified hex by passing it as an argument to this command."
    },
    {
        name: "/lookup (id)", value: "Look up detailed information about registered facilities given its id. The id must be valid."
    },
    {
        name: "/addfac", value: "You can register a facility using this command! The bot will prompt you for information on your facility through a series of click-buttons, option selects, and text input."
    },
    {
        name: "/editfac (id)", value: "Edit a registered facility given its id. Use this command to edit contact info, production info, etc."
    },
    {
        name: "/help", value: "Opens up the help display. You may enter this command at any time."
    },
    {
        name: "/restock (id) (item) (stock) (OPTIONAL password)", value: "Restocks an **export item** to a certain amount. Enter the id of the facility, the item, and the new stock level. If your facility is password-locked, a password is required."
    }
);

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.reply({embeds: [embed]});

    }
}
