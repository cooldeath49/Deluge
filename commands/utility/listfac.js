const { SlashCommandBuilder } = require("discord.js");
const storage = require("../../storage.js");
const allfacs = storage.allfacs;
const data = new SlashCommandBuilder()
  .setName("listfac")
  .setDescription("List facilities in a particular hex or all facilities")
  .addStringOption((option) => option
    .setName("hex")
    .setDescription("Hex to search for facilities")
    .setAutocomplete(true)

  );

function printFac(fac) {
  return fac.regiment + " facility in " + storage.coord(fac) + " id=" + fac.id + "   *last updated <t:" + Math.floor(fac.lastupdated / 1000) + ":R>*";
}


module.exports = {
  data: data,
  async autocomplete(interaction) {
    let choices = storage.facs_name_map;
    let filtered = choices.filter(choice => choice.startsWith(interaction.options.getFocused()));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    )
  },
  async execute(interaction) {
    if (storage.get_count() == 0) {
      interaction.reply("No facilities have been registered!");
      return;
    } else {
      await interaction.deferReply();
      let target = interaction.options.getString('hex');
      console.log(!target);
      if (!target) {
        let str = "**All Facilities**\n";
        for (let i = 0; i < storage.facs_name_map.length; i++) {
          if (allfacs[i].length > 0) {
            str = str + "**" + storage.facs_name_map[i] + "**\n";
            for (let k = 0; k < allfacs[i].length; k++) {
              let fac_details = allfacs[i][k].toEmbedData();
              str = str + allfacs[i][k].toString() + "\n";
            }
          }
        }
        console.log("bruh");
        interaction.followUp(str);
        // } else if () {

      } else {
        let ind = storage.get_name_index(target);
        if (ind >= 0) {
          if (storage.allfacs[ind].length > 0) {
            let str = "";
            str = str + "**" + storage.facs_name_map[ind] + "**\n";
            for (let k = 0; k < storage.allfacs[ind].length; k++) {
              str = str + allfacs[ind][k].toString() + "\n";
            }
            await interaction.followUp(str);
          } else {
            await interaction.followUp(target + " has no registered facilities!");
          }
        } else {
          await interaction.followUp("Could not find target hex \"" + target + "\"!");
        }
        
      }
    }
  }
}
