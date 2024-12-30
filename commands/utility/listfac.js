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

async function getHexEmbed(hex_array) {
  if (await database.countDocuments({hex: hex_array[0]}) > 0) {
    let embed = new EmbedBuilder()
    .setTitle(hex_array[0] + " Facilities");
  
    for (let k = 1; k < hex_array.length; k++) {
      let curr_town = hex_array[k];
      console.log("Now parsing " + curr_town);
      let all = await database.find({town: curr_town}).toArray();
      console.log(all);
      let townstr = "";
      if (all.length > 0) {
        console.log("Detected facilities in town " + curr_town);
        for (let j = 0; j < all.length; j++) {
          let fac = all[j];
          townstr = townstr + "\"" + fac["nickname"] + "\" - " + storage.getProdString(fac, 10) + " - " + fac["contact"] + " - " + fac["id"] + "\n";
        }
        embed.addFields({name: curr_town, value: townstr});
      }
      
    }
    return embed;
  } else {
    return null;
  }

  
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
    if (storage.global_count == 0) {
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

        for (let i = 0; i < storage.newhexes1.length; i++) {
          let embed = await getHexEmbed(storage.newhexes1[i]);
          if (embed) {
            embed_array.push(embed);
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
