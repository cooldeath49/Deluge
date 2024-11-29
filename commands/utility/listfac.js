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
  return fac.regiment + " facility in " + storage.coord(fac) + " id=" + fac.id + "   *last updated <t:" + Math.floor(fac.lastupdated/1000) + ":R>*";
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
  async execute(interaction2) {
    if (storage.get_count() == 0) {
      interaction2.reply("No facilities have been registered!");
      return;
    } else {
      let target = interaction2.options.getString('hex');
      console.log(target);
      if (!target) {
        let str = "**All Facilities**\n";
        for (let i = 0; i < storage.facs_name_map.length; i++) {
          if (storage.allfacs[i].length > 0) {
            str = str + "**" + storage.facs_name_map[i] + "**\n";
            for (let k = 0; k < storage.allfacs[i].length; k++) {
              str = str + allfacs[i][k].toString() + "\n";
            }
          }
          
        interaction2.reply(str);
        }
      // } else if () {

      }
    }
  }
}
