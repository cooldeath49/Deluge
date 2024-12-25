const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
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


//assumes hex has at least one facility
function getHexEmbed(hex) {
  let embed = new EmbedBuilder()
  .setTitle(hex.name + " Facilities")
  for (let k = 0; k < hex.towns.length; k++) {
    let town = hex.towns[k];
    let townstr = "";
    if (town.fac_count > 0) {
      console.log("Detected facilities in town " + town.name);
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
        this.primary, 10
        this.secondary, 11
        */
        townstr = townstr + "\"" + fac_details[6] + "\" - " + fac_details[10].getString() + " - " + fac_details[5] + " - " + fac_details[9] + "\n";
      }
      embed.addFields({name: town.name, value: townstr});
    }
    
  }
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
      await interaction.deferReply();
      let target = interaction.options.getString('hex');
      if (!target) { //No target specified, load all facilities
        let embed_array = [];
        let headerEmbed = new EmbedBuilder()
        .setTitle("All Facilities")
        .setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")
        embed_array.push(headerEmbed);

        for (let i = 0; i < allfacs.hexes.length; i++) {
          let hex = allfacs.hexes[i];
          if (hex.fac_count > 0) {
            embed_array.push(getHexEmbed(hex));
          }
        }
        interaction.followUp({content: "", embeds: embed_array});

      } else {
        let hex = allfacs.get_hex(target);
        if (hex) {
          if (hex.fac_count > 0) {
            let embed = getHexEmbed(hex);
            embed.setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")
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
