const { SlashCommandBuilder, EmbedBuilder, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const {hexes1, database, hexes2, allhexes_fuse} = require("../../storage.js");

const data = new SlashCommandBuilder()
  .setName("listfac")
  .setDescription("List facilities in a particular hex or all facilities")
  .addStringOption((option) => option
    .setName("hex")
    .setDescription("Hex to search for facilities")

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
  async execute(interaction) {
    await interaction.deferReply();
    if (await database.countDocuments() - 1 == 0) {
      interaction.followUp("No facilities have been registered!");
      return;
    } else {
      let facilities = await database.find().toArray();
      let target = interaction.options.getString('hex');
      if (!target) { //No target specified, load all facilities
        let headerEmbed = new EmbedBuilder()
        .setTitle("All Facilities")
        .setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")


        let embeds1 = await getHexEmbed(hexes1, facilities);
        let embeds2 = await getHexEmbed(hexes2, facilities);

        let embeds = embeds1.concat(embeds2);

        if (embeds.length > 4) {
          let counter = 3;
          let embeds_length = Math.ceil(embeds.length / 4);
          let curr = 0;
          let embed_array = [embeds[0], embeds[1], embeds[2], embeds[3]];

          let next = new ButtonBuilder()
          .setLabel("Next (" + (curr + 1).toString() + "/" + embeds_length + ")")
          .setCustomId("next")
          .setStyle(ButtonStyle.Primary);

          let back = new ButtonBuilder()
          .setLabel("Back (" + (curr + 1).toString() + "/" + embeds_length + ")")
          .setCustomId("back")
          .setStyle(ButtonStyle.Primary);

          let response = await interaction.followUp({ content: "", components: [new ActionRowBuilder().addComponents(next)], embeds: [headerEmbed].concat(embed_array)});
            
          let buttoncollector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 360_000,
            filter: i => i.user.id === interaction.user.id,
          })
          buttoncollector.on('collect', async int => {
            buttoncollector.resetTimer();
            if (int.customId == "next") {
              curr += 1;
            } else if (int.customId == "back") {
              curr -= 1;
            }
            let embed_counter = curr * 4;
            let inc_counter = 0;
            embed_array = [];
            while (embed_counter < embeds.length && inc_counter < 4) {
              embed_array.push(embeds[embed_counter]);
              embed_counter++;
              inc_counter++;
            }

            if (curr == embeds_length - 1) {
              back.setLabel("Back (" + (curr + 1).toString() + "/" + embeds_length + ")");
              await int.update({components: [new ActionRowBuilder().addComponents(back)], embeds: [headerEmbed].concat(embed_array)});
            } else if (curr == 0) {
              next.setLabel("Next (" + (curr + 1).toString() + "/" + embeds_length + ")");
              await int.update({components: [new ActionRowBuilder().addComponents(next)], embeds: [headerEmbed].concat(embed_array)});
            } else {
              next.setLabel("Next (" + (curr + 1).toString() + "/" + embeds_length + ")");
              back.setLabel("Back (" + (curr + 1).toString() + "/" + embeds_length + ")");
              await int.update({components: [new ActionRowBuilder().addComponents(back, next)], embeds: [headerEmbed].concat(embed_array)});
            }
          });

          buttoncollector.on("end", async e => {
            interaction.followUp("Interaction closed: a response was not received within one minute!")
          });
    
          
        } else {
          interaction.followUp({content: "", embeds: [headerEmbed].concat(embeds)});
        }

      } else {
        let fused_target = allhexes_fuse.search(target);
        if (fused_target.length > 0) {
          let found = fused_target[0].item;

          let embeds = await getHexEmbed([[found]], facilities);
          if (embeds.length > 0) {
              embeds[0].setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")
              await interaction.followUp({content: "", embeds: embeds});
          } else {
            await interaction.followUp(found + " has no registered facilities!");
          }
        
        } else {
          await interaction.followUp("Could not find target hex \"" + target + "\"!");
        }
        
      }
    }
  }
}
