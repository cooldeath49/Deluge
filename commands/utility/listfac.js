const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const storage = require("../../storage.js");
const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://arthuritisyou:luoyuan1@deluge.nxwj2.mongodb.net/?retryWrites=true&w=majority&appName=Deluge";

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");

const allfacs = storage.allfacs;
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
    for (let hex_array of search_array) {
      if (fac.hex == hex_array[0]) {
        if (hexes_strs[fac.hex]) { //already an entry for this hex
          if (hexes_strs[fac.hex][fac.town]) { //town has an entry
            hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] + 
            "\"" + fac.nickname + "\" - " + storage.getTooltip(fac, "primary") + " - " + fac.contact + " - " + fac.id + "\n";
          } else { //no town, initialize string
            hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\" - " + 
            storage.getTooltip(fac, "primary") + " - " + fac.contact + " - " + fac.id + "\n";
          } 
        } else { //no hex entry
          hexes_strs[fac.hex] = {}; //initialize
          hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\" - " +  //if no hex, assume no town
            storage.getTooltip(fac, "primary") + " - " + fac.contact + " - " + fac.id + "\n";
        }
      }
    }
  }

  for (let hex in hexes_strs) {
    let embed = new EmbedBuilder()
    .setTitle(hex + " Facilities");
    for (let town in hexes_strs[hex]) {
      embed.addFields({name: town, value: hexes_strs[hex][town]});
    }
    embeds.push(embed);
  }

  return embeds;
  
  
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
    await interaction.deferReply();
    if (await database.countDocuments() - 1 == 0) {
      interaction.reply("No facilities have been registered!");
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


        // for (let i = 0; i < storage.newhexes1.length; i++) {
        //   let embed = await getHexEmbed(storage.newhexes1[i]);
        //   if (embed.length > 0) {
        //     embed_array.push(embed);
        //   }
        // }
        let embeds = await getHexEmbed(storage.newhexes1, facilities);

        interaction.followUp({content: "", embeds: embed_array.concat(embeds)});

      } else {
        if (storage.facs_name_map.indexOf(target) > 0) {

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
