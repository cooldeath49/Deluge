const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, Component, ActionRowBuilder, Events } = require("discord.js");
const {database, items_fuse, client, toEmbed} = require("../../storage.js");
const data = new SlashCommandBuilder()
    .setName("restock")
    .setDescription("Conveniently restock export items in a certain facility")
    .addIntegerOption((option) => option
        .setName("id")
        .setDescription("Enter the id of a facility")
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("item")
        .setDescription("Enter the export item to be restocked")
        .setRequired(true)
    )
    .addIntegerOption((option) => option
        .setName("stock")
        .setDescription("Enter the new stock amount of this item")
        .setRequired(true)
        .setMinValue(0)
    )
    .addStringOption((option) => option
        .setName("password")
        .setDescription("If your facility is password-locked, the password is required")
        .setRequired(false)
    )

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.deferReply();
        let id = interaction.options.getInteger('id');
        let pw = interaction.options.getString("password")
        let item = interaction.options.getString("item");
        let stock = interaction.options.getInteger("stock");
        let fac = await database.findOne({id: id});

        if (fac) {
            if ((fac.password && pw) || !fac.password) {
                if (fac.password == pw) {
                    let fuse_item = items_fuse.search(item);
                    if (fuse_item.length > 0) {
                        let item_slice = fac.exports.find((slice) => slice[1].find((inner) => inner[0] == fuse_item[0].item));
                        if (item_slice) {
                            let embed = new EmbedBuilder()
                            .setTitle("Restock " + fuse_item[0].item + " to " + stock + "?");

                            let yes = new ButtonBuilder()
                            .setLabel("Yes")
                            .setCustomId("yes")
                            .setStyle(ButtonStyle.Success);

                            let no = new ButtonBuilder()
                            .setLabel("No")
                            .setCustomId("no")
                            .setStyle(ButtonStyle.Danger);

                            await interaction.editReply({components: [new ActionRowBuilder().addComponents(yes, no)], embeds: toEmbed(fac).concat([embed])});

                            client.once(Events.InteractionCreate, async submitted => {
                                if (!submitted.isButton() || (submitted.customId != "yes" && submitted.customId != "no")) return;
                                if (submitted.customId == "yes") {
                                    let slice = item_slice[1].find((inner) => inner[0] == fuse_item[0].item);
                                    console.log(slice);
                                    slice[1] = stock; 
                                    slice[2] = Math.floor(Date.now()/1000);
                                    await database.replaceOne({ id: fac.id }, fac);
                                    let newEmbed = new EmbedBuilder()
                                    .setTitle("Successfully restocked " + fuse_item[0].item + "!")
                                    .setDescription("New stock: " + stock + " " + fuse_item[0].item);

                                    await submitted.update({components: [], embeds: toEmbed(fac).concat([newEmbed])});
                                }

                                }
                            )
                        } else {
                            await interaction.editReply(fuse_item[0].item + " is not a listed export in your facility!");
                        }
                    } else {
                        await interaction.editReply("Item " + item + " is not a valid item!");
                    }
                    
                    
                } else {
                    await interaction.editReply("Incorrect password!");
                }
            } else {
                await interaction.editReply("This facility requires a password!");
            }
        } else {
            await interaction.editReply("No facility with id " + id + " could be found!");
        }


        /*let fac = allfacs.facility_id_tracker[id];
        if (fac) {
            let embed = fac.toEmbed();
            await interaction.reply({ content: "", embeds: embed });
        } else {
            await interaction.reply("No facility with id " + id + " could be found!");
        }*/

    }
}
