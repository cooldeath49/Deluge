
const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName("pingpong")
  .setDescription("Replies with pong"),
  execute(interaction) {
    interaction.reply("Pong");
  },
};