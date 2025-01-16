const { SlashCommandBuilder, EmbedBuilder, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const {hexes1, hexes1only, database, hexes1_fuse, items_fuse, items, items_cate_fuse } = require("../../storage.js");


const data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search the database for an item or a vehicle service")
    .addSubcommand((subcommand) => subcommand
        .setName("imports")
        .setDescription("Search through import categories")
        .addStringOption((option) => option
            .setName("query")
            .setDescription("Item or a category to search for")
            .setRequired(true)
        ).addStringOption((option) => option
        .setName("hex")
        .setDescription("Search through a hex only")
        .setRequired(false)
    )
    ).addSubcommand((subcommand) => subcommand
    .setName("exports")
    .setDescription("Search through export categories")
    .addStringOption((option) => option
        .setName("query")
        .setDescription("Item or category to search for")
        .setRequired(true)
    ).addStringOption((option) => option
    .setName("hex")
    .setDescription("Search through a hex only")
    .setRequired(false)
)
    ).addSubcommand((subcommand) => subcommand
    .setName("services")
    .setDescription("Search through vehicle service categories")
    .addStringOption((option) => option
        .setName("query")
        .setDescription("Vehicle or service to search for")
        .setRequired(true)
    ).addStringOption((option) => option
    .setName("hex")
    .setDescription("Search through a hex only")
    .setRequired(false)
)
)

 //assumes facilities contains only facilities that satisfy the item query
async function toEmbedSearch(item, section, facilities) {
  let embeds = [];
  let hexes_strs = {}; 
  for (let i = 0; i < facilities.length; i++) {
    let fac = facilities[i];
    let slice = fac[section].find((element) => element.category == item);
    if (slice) { //input was a category
      if (hexes_strs[fac.hex]) { //already an entry for this hex
        if (hexes_strs[fac.hex][fac.town]) { //town has an entry
          hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] + 
          "\"" + fac.nickname + "\": " + item + " - ID-" + fac.id + "\n";
          // "Nickname", Weapons Platform - ID-39
          // "Another Nickname", Tank Factory - ID-40
        } else { //no town, initialize string
          hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + item + " - ID-" + fac.id + "\n";
        } 
      } else { //no hex entry
        hexes_strs[fac.hex] = {}; //initialize
        hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + item + " - ID-" + fac.id + "\n";
      }
    } else {//input must be an item
      let ind = fac[section].findIndex((cate) => cate.arr.find((ele) => ele.name == item));
      if (ind >= 0) { //item exists in the facility
        slice = fac[section][ind].arr.find((ele) => ele.name == item);
        if (hexes_strs[fac.hex]) { //already an entry for this hex
          if (hexes_strs[fac.hex][fac.town]) { //town has an entry
            hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] + 
            "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
            //"Nickname": 500 Concrete, last updated 1 day ago - ID-38
          } else { //no town, initialize string
            hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
          } 
        } else { //no hex entry
          hexes_strs[fac.hex] = {}; //initialize
          hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
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
    // await interaction.reply("WIP");
    await interaction.deferReply();
    if (await database.countDocuments() - 1 == 0) {
      interaction.followUp("No facilities have been registered!");
      return;
    } else {
    
      let target = interaction.options.getString('hex');

      if (!target) { //No target specified, load all facilities
        let subcmd = interaction.options.getSubcommand();
        let item;
        let fuse_item;
        let facilities;
        if (subcmd == "imports" || subcmd == "exports") {
          item = interaction.options.getString("query");
          fuse_item = items_cate_fuse.search(item);
          console.log(item, fuse_item);
          if (fuse_item.length > 0) {
            if (Object.keys(items).indexOf(fuse_item[0].item) >= 0) {
              //category search
              facilities = await database.find({
                imports: {
                  category: fuse_item[0].item
                }
              }).toArray();
              console.log(facilities);
            }
          }
          
        }
        let headerEmbed = new EmbedBuilder()
        .setTitle("All Facilities")
        .setDescription("If a town is undisplayed, then there are no registered facilities in that town\nUse /lookup for specific facility information\nFacility format: Nickname - Main production - Contact - ID")


        let embeds = await getHexEmbed(hexes1, facilities);

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
            time: 60_000,
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
        let fused_target = hexes1_fuse.search(target);
        if (fused_target.length > 0 && hexes1only.indexOf(fused_target[0].item) >= 0) {
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
