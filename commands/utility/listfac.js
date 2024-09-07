const { SlashCommandBuilder } = require("discord.js");
const storage = require("../../storage.js");
const allfacs = storage.allfacs;
const data = new SlashCommandBuilder()
  .setName("listfac")
  .setDescription("List facilities in a particular hex or all facilities")
  .addStringOption((option) =>
    option.setName("hex")
    .setDescription("Hex to search for facilities"));

function printFac(fac) {
  return fac.regiment + " facility in " + storage.coord(fac) + " id=" + fac.id + "   *last updated <t:" + Math.floor(fac.lastupdated/1000) + ":R>*";
}

module.exports = {
  data: data,
  execute(interaction) {
    if (allfacs.length == 0) {
      interaction.reply("No facilities in list!");
      return;
    } else {
      let str = "**All Facilities**\n";
      for (let i = 0; i < allfacs.length; i++) {
        str = str + printFac(allfacs[i]) + "\n";
      }
      interaction.reply(str);
    }
  }
}
