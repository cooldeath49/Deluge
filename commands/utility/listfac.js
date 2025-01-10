const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const {hexes1, hexes1only, database} = require("../../storage.js");

const data = new SlashCommandBuilder()
  .setName("listfac")
  .setDescription("List facilities in a particular hex or all facilities")
  .addStringOption((option) => option
    .setName("hex")
    .setDescription("Hex to search for facilities")
    .setAutocomplete(true)

  );

  //Given an array headed by the Hex name followed by all towns, search database for 
  //facilities in that hex
  //1. Retrieve all documents that belong to the hex and perform operations
  //on them from the bot instead of pulling, should be faster
  //@param search_array: an array of an array of towns, headed by the hex name
  //@param facilities: array of all facilities
async function getHexEmbed(search_array, facilities) {
  let embeds = [];
  let hexes_strs = {}; //crazy nested dictionary
  // hexes_strs[i][j]
  //i key: hex name, points to another dictionary
  //j key: Town name, points to town string
  for (let i = 0; i < facilities.length; i++) {
    let fac = facilities[i];
    for (let ind in search_array) {
      if (fac.hex == search_array[ind][0]) {
        if (hexes_strs[fac.hex]) { //already an entry for this hex
          if (hexes_strs[fac.hex][fac.town]) { //town has an entry
            hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] + 
            "\"" + fac.nickname + " - " + "\" ID-" + fac.id + "\n";
          } else { //no town, initialize string
            hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\" ID-" + fac.id + "\n";
          } 
        } else { //no hex entry
          hexes_strs[fac.hex] = {}; //initialize
          hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\" ID-" + fac.id + "\n";
        }
      }
    }
  }

  for (let hex in hexes_strs) {
    let embed = new EmbedBuilder()
    .setTitle(hex + " Facilities");
    for (let town in hexes_strs[hex]) {
      embed.addFields({name: town, value: hexes_strs[hex][town], inline: true});
    }
    embeds.push(embed);
  }

  return embeds;
  
  
}

module.exports = {
  data: data,
  async autocomplete(interaction) {
    let choices = hexes1only; //TODO: replace this with a static map
    let filtered = choices.filter(choice => choice.startsWith(interaction.options.getFocused()));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    )
  },
  async execute(interaction) {
    await interaction.deferReply();
    if (await database.countDocuments() - 1 == 0) {
      interaction.followUp("No facilities have been registered!");
      return;
    } else {
      let facilities = await database.find().toArray();
      let target = interaction.options.getString('hex');
      if (!target) { //No target specified, load all facilities
        let embed_array = [];
        let headerEmbed = new EmbedBuilder()
        .setTitle("All Facilities")
        .setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")
        embed_array.push(headerEmbed);

        let embeds1 = await getHexEmbed(hexes1, facilities);

        interaction.followUp({content: "", embeds: embed_array.concat(embeds1)});

      } else {
        if (hexes1only.indexOf(target) >= 0) {

          let embeds = await getHexEmbed([[target]], facilities);
          if (embeds.length > 0) {
              embeds[0].setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")
              await interaction.followUp({content: "", embeds: embeds});
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
