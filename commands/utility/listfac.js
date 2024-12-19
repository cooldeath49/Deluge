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

//assumes hex has at least one facility
function getHexEmbed(hex) {
  let embed = new EmbedBuilder()
  .setTitle(hex.name + " Facilities")
  for (let k = 0; k < hex.towns.length; k++) {
    let town = hex.towns[k];
    let townstr = "";
    if (town.fac_count > 0) {
      for (let j = 0; j < town.facilities.length; j++) {
        let fac = town.facilities[j];
        let fac_details = fac.toEmbedData();
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
        townstr = townstr + "\"" + fac_details[6] + "\" - ID " + fac_details[9] + "\n";
      }
      embed.addFields({name: town.name, value: townstr});
    }
    
  }
  embed.setDescription("If a town is undisplayed, then there are no registered facilities in that town");
  return embed;
}

module.exports = {
  data: data,
  async autocomplete(interaction) {
    let choices = allfacs.hexes_str_array; //TODO: replace this with a static map
    let filtered = choices.filter(choice => choice.startsWith(interaction.options.getFocused()));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    )
  },
  async execute(interaction) {
    if (allfacs.global_count == 0) {
      interaction.reply("No facilities have been registered!");
      return;
    } else {
      let embed_array = [];
      await interaction.deferReply();
      let target = interaction.options.getString('hex');
      console.log(target);
      if (!target) {
        let str = "**All Facilities**\n";
        for (let i = 0; i < allfacs.hexes.length; i++) {
          let hex = allfacs.hexes[i];
          if (hex.fac_count > 0) {
            embed_array.push(getHexEmbed(hex));
          }
        }
        console.log("bruh");
        interaction.followUp({content: "", embeds: embed_array});

      } else {
        let hex = allfacs.get_hex(target);
        if (hex) {
          if (hex.global_count > 0) {
            let town_str = "";
            let runby_str = "";
            let id_str = "";

            let embed = new EmbedBuilder()
            .setTitle(hex.name + " Facilities")

            let str = "";
            str = str + "**" + storage.facs_name_map[ind] + "**\n";
            for (let i = 0; i < hex.towns.length; i++) {
              let town = hex.towns[i];

              for (let j = 0; j < towns.facilities.length; j++) {

              }
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
