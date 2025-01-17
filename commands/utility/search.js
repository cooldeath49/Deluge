const { SlashCommandBuilder, EmbedBuilder, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const { hexes1, hexes1only, database, hexes1_fuse, items_fuse, items, items_cate_fuse, services_cate_fuse, services_fuse } = require("../../storage.js");


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
            if (section == "services") {
              hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] +
                "\"" + fac.nickname + "\": " + slice.name + " - ID-" + fac.id + "\n";
            } else {
              hexes_strs[fac.hex][fac.town] = hexes_strs[fac.hex][fac.town] +
                "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
            }
            //"Nickname": 500 Concrete, last updated 1 day ago - ID-38
          } else { //no town, initialize string
            if (section == "services") {
              hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.name + " - ID-" + fac.id + "\n";
            } else {
              hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
            }
          }
        } else { //no hex entry
          hexes_strs[fac.hex] = {}; //initialize
          if (section == "services") {
            hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.name + " - ID-" + fac.id + "\n";
          } else {
            hexes_strs[fac.hex][fac.town] = "\"" + fac.nickname + "\": " + slice.stock + " " + slice.name + ", *last updated <t:" + slice.date + ":R>* - ID-" + fac.id + "\n";
          }
        }
      }

    }
  }

  for (let hex in hexes_strs) {
    let embed = new EmbedBuilder()
      .setTitle(hex);
    for (let town in hexes_strs[hex]) {
      embed.addFields({ name: town, value: hexes_strs[hex][town], inline: true });
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
      let target_hex;
      if (target) {
        let fused_target = hexes1_fuse.search(target);
        if (fused_target.length > 0 && hexes1only.indexOf(fused_target[0].item) >= 0) {
          target_hex = fused_target[0].item;
        }
      }
      let subcmd = interaction.options.getSubcommand();
      let item;
      let fuse_item;
      let facilities;
      let headerEmbed = new EmbedBuilder()
      if (subcmd == "imports" || subcmd == "exports") {
        item = interaction.options.getString("query");
        let arr = items_cate_fuse.search(item);
        console.log(arr);
        if (arr.length > 0 && arr[0].score < 0.4) { //return was found
          fuse_item = arr[0].item;
          //category search
          if (subcmd == "imports") {
            if (target_hex) {
              facilities = await database.find({
                "imports.category": fuse_item,
                "hex": target_hex
              }).toArray();
            } else {
              facilities = await database.find({
                "imports.category": fuse_item
              }).toArray();
            }
          } else {
            if (target_hex) {
              facilities = await database.find({
                "exports.category": fuse_item,
                "hex": target_hex
              }).toArray();
            } else {
              facilities = await database.find({
                "exports.category": fuse_item
              }).toArray();
            }
          }
        } else {
          arr = items_fuse.search(item);
          console.log(arr);
          if (arr.length > 0 && arr[0].score < 0.4) { //return was found
            fuse_item = arr[0].item;
            //category search
            if (subcmd == "imports") {
              if (target_hex) {
                facilities = await database.find({
                  "imports.arr.name": fuse_item,
                  "hex": target_hex
                }).toArray();
              } else {
                facilities = await database.find({
                  "imports.arr.name": fuse_item
                }).toArray();
              }

            } else {
              if (target_hex) {
                facilities = await database.find({
                  "exports.arr.name": fuse_item,
                  "hex": target_hex
                }).toArray();
              } else {
                facilities = await database.find({
                  "exports.arr.name": fuse_item
                }).toArray();
              }
            }

          } else {
            await interaction.followUp(item + " is not a valid query!");
            return;
          }
        }

        if (target_hex) {
          headerEmbed.setTitle(target_hex + " Facilities with " + fuse_item + " " + subcmd.charAt(0).toUpperCase() + subcmd.substring(1));
        } else {
          headerEmbed.setTitle("All Facilities with " + fuse_item + " " + subcmd.charAt(0).toUpperCase() + subcmd.substring(1));
        }
        headerEmbed.setDescription("Use /lookup for specific facility information");

      } else if (subcmd == "services") { //services
        item = interaction.options.getString("query");
        let arr = services_cate_fuse.search(item);
        console.log(arr);
        if (arr.length > 0 && arr[0].score < 0.4) { //return was found
          fuse_item = arr[0].item;
          if (target_hex) {
            facilities = await database.find({
              "services.category": fuse_item,
              "hex": target_hex
            }).toArray();
          } else {

            facilities = await database.find({
              "services.category": fuse_item
            }).toArray();
          }

        } else {
          arr = services_fuse.search(item);
          console.log(arr);
          if (arr.length > 0 && arr[0].score < 0.4) { //return was found
            fuse_item = arr[0].item;
            //category search
            if (target_hex) {
              facilities = await database.find({
                "services.arr.name": fuse_item,
                "hex": target_hex
              }).toArray();

            } else {

              facilities = await database.find({
                "services.arr.name": fuse_item
              }).toArray();
            }
            console.log(facilities);
            headerEmbed.setTitle("All Facilities with " + fuse_item + " Upgrades");
            headerEmbed.setDescription("Use /lookup for specific facility information");

          } else {
            await interaction.followUp(item + " is not a valid query!");
            return;
          }
        }

        if (target_hex) {
          headerEmbed.setTitle(target_hex + " Facilities with " + fuse_item + " Upgrades");
        } else {
          headerEmbed.setTitle("All Facilities with " + fuse_item + " Upgrades");
        }
        headerEmbed.setDescription("Use /lookup for specific facility information");

      }

      if (facilities.length <= 0 && target_hex) {
        let embed = new EmbedBuilder()
        .setTitle("No facilities found in " + target_hex + " that matches the search criteria!");
        await interaction.followUp({embeds: [embed]}) 
        return;
      }
      let embeds = await toEmbedSearch(fuse_item, subcmd, facilities);

      if (embeds.length > 4) {
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

        let response = await interaction.followUp({ content: "", components: [new ActionRowBuilder().addComponents(next)], embeds: [headerEmbed].concat(embed_array) });

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
            await int.update({ components: [new ActionRowBuilder().addComponents(back)], embeds: [headerEmbed].concat(embed_array) });
          } else if (curr == 0) {
            next.setLabel("Next (" + (curr + 1).toString() + "/" + embeds_length + ")");
            await int.update({ components: [new ActionRowBuilder().addComponents(next)], embeds: [headerEmbed].concat(embed_array) });
          } else {
            next.setLabel("Next (" + (curr + 1).toString() + "/" + embeds_length + ")");
            back.setLabel("Back (" + (curr + 1).toString() + "/" + embeds_length + ")");
            await int.update({ components: [new ActionRowBuilder().addComponents(back, next)], embeds: [headerEmbed].concat(embed_array) });
          }
        });

        buttoncollector.on("end", async e => {
          interaction.followUp("Interaction closed: a response was not received within one minute!")
        });


      } else {
        interaction.followUp({ content: "", embeds: [headerEmbed].concat(embeds) });
      }

    }
  }
}
