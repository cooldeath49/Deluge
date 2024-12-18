const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
    let choices = allfacs.hexes_str_array;
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
        for (let i = 0; i < allfacs.hexes.length; i++) {
          let hex = allfacs.hexes[i];
          if (hex.fac_count > 0) {
            str = str + "**" + storage.hexes[i].name + "**\n";
            for (let k = 0; k < allfacs.hexes[i].towns.length; k++) {
              let town = hex.towns[k];
              for (let j = 0; j < town.facilities.length; j++) {
                let fac = town.facilities[j];
                let fac_details = fac.toEmbedData();
                /*
                this.hex,
                this.town,
                this.letter,
                this.number,
                this.regiment,
                this.contact,
                this.nickname,
                this.field,
                this.relative,
                this.id,
                */
                str = str + fac.toString() + "\n";
              }
              
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
            let town_str = "";
            let runby_str = "";
            let id_str = "";

            let embed = new EmbedBuilder()
            .setTitle(storage.facs_name_map[ind] + " Facilities")

            let str = "";
            str = str + "**" + storage.facs_name_map[ind] + "**\n";
            for (let k = 0; k < storage.allfacs[ind].length; k++) {
              let fac_details = allfacs[ind][k].toEmbedData();
              /*
              this.hex, 0
              this.town, 1
              this.letter, 2
              this.number, 3
              this.regiment, 4
              this.contact, 5
              this.nickname, 6
              this.field, 7
              this.relative, 8
              this.id, 9
              */
              town_str = town_str + fac_details[1] + "\n";
              if (fac_details[4]) {
                runby_str = runby_str + fac_details[4] + "\n";
              } else {
                runby_str = runby_str + fac_details[5] + "\n";
              }
              id_str = id_str + fac_details[9] + "\n";

              str = str + allfacs[ind][k].toString() + "\n";
            }
            embed.addFields(
              {name: "Town", value: town_str, inline: true},
              {name: "Run By", value: runby_str, inline: true},
              {name: "ID", value: id_str, inline: true}
            )
            await interaction.followUp({content: "", embeds: [embed]});
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
