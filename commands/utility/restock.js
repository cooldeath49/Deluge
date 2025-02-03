const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ActionRowBuilder, Events, TextInputBuilder, TextInputStyle, ModalBuilder } = require("discord.js");
const {database, items_fuse, client, toEmbed, createHexImage} = require("../../storage.js");
const data = new SlashCommandBuilder()
    .setName("restock")
    .setDescription("Conveniently restock import or export items in a facility")
    .addIntegerOption((option) => option
        .setName("id")
        .setDescription("Enter the id of a facility")
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("item")
        .setDescription("Enter the item to be restocked")
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("action")
        .setDescription("Choose the restock action: Add, Pull, or Set")
        .setRequired(true)
        .addChoices(
            {name: "add", value: "add"},
            {name: "pull", value: "pull"},
            {name: "set", value: "set"}
        )
    )
    .addIntegerOption((option) => option
        .setName("stock")
        .setDescription("Enter the quantity of this item")
        .setRequired(true)
        .setMinValue(0)
    )
    .addStringOption((option) => option 
        .setName("password")
        .setDescription("If your facility is passwordlocked, this field is required")
        .setRequired(false)
        .setMinLength(4)
        .setMaxLength(8)
    )

module.exports = {
    data: data,
    async execute(interaction) {
        await interaction.deferReply();
        let id = interaction.options.getInteger('id');
        let pw = interaction.options.getString("pw");
        let item = interaction.options.getString("item");
        let action = interaction.options.getString("action");
        let stock = interaction.options.getInteger("stock");
        let fac = await database.findOne({id: id});

        if (fac) {
            if (fac.password && pw) {
                if (pw != fac.password) {
                    await interaction.editReply("Incorrect password!")
                    return;
                }
            } 
            
            
            let fuse_item = items_fuse.search(item);
            if (fuse_item.length > 0) {
                let name = fuse_item[0].item;
                let import_slice = fac.imports.find((slice) => slice.arr.find((inner) => inner.name == fuse_item[0].item)); //search imports
                let export_slice = fac.exports.find((slice) => slice.arr.find((inner) => inner.name == fuse_item[0].item)); //search exports
                let slice;
                if (import_slice || export_slice) {
                    let buffer = await createHexImage([fac], fac.hex);
                    let file = new AttachmentBuilder(buffer);

                    if (import_slice && export_slice) {
                        let import_button = new ButtonBuilder()
                        .setLabel("Imports")
                        .setCustomId("imports")
                        .setStyle(ButtonStyle.Primary);
    
                        let export_button = new ButtonBuilder()
                        .setLabel("Exports")
                        .setCustomId("exports")
                        .setStyle(ButtonStyle.Primary)
    
                        let footer = new EmbedBuilder()
                        .setTitle(name + " is both an Import and Export item: which category are you editing?");
    
                        let response = await interaction.editReply({
                            components: [new ActionRowBuilder().addComponents(import_button, export_button)], 
                            embeds: toEmbed(fac).concat([footer]),
                            files: [file]
                        })
                    
                        await response.awaitMessageComponent({
                            filter: i => i.user.id === interaction.user.id,
                            time: 360_000
                        }).then(async inter => {
                            if (inter.customId == "imports") {
                                slice = import_slice;
                                interaction = inter;
                            } else if (inter.customId == "exports") {
                                slice = export_slice;
                                interaction = inter;
                            }
                        }).catch((e) => console.log(e));
                    } else {
                        slice = import_slice ?? export_slice;
                    }
                    
                    let embed = new EmbedBuilder()

                    if (action == "pull") {
                        embed.setTitle("Pull " + stock.toString() + " " + name + " from this facility?");
                    } else if (action == "add") {
                        embed.setTitle("Add " + stock.toString() + " " + name + " to this facility?");
                    } else if (action == "set") {
                        embed.setTitle("Set " + name + " stocks to " + stock.toString() + " in this facility?");
                    }

                    let yes = new ButtonBuilder()
                    .setLabel("Yes")
                    .setCustomId("yes")
                    .setStyle(ButtonStyle.Success);

                    let no = new ButtonBuilder()
                    .setLabel("No")
                    .setCustomId("no")
                    .setStyle(ButtonStyle.Danger);
                    let response;
                    if (interaction.replied || interaction.deferred) {
                        response = await interaction.editReply({components: [new ActionRowBuilder().addComponents(yes, no)], embeds: toEmbed(fac).concat([embed]), files: [file]});
                    } else {
                        response = await interaction.update({components: [new ActionRowBuilder().addComponents(yes, no)], embeds: toEmbed(fac).concat([embed]), files: [file]});
                    
                    }

                    await response.awaitMessageComponent({
                        filter: i => i.user.id === interaction.user.id,
                        time: 360_000
                    }).then(async inter => {
                        if (inter.customId == "no") {
                            let newEmbed = new EmbedBuilder()
                            .setTitle("Interaction cancelled")
                            await inter.update({components: [], embeds: toEmbed(fac).concat([newEmbed])})
                        } else if (inter.customId == "yes") {
                            let in_slice = slice.arr.find((inner) => inner.name == name);
                            let newEmbed = new EmbedBuilder()
                            if (action == "pull") {
                                in_slice.stock = in_slice.stock - stock >= 0 ? in_slice.stock - stock : 0;
                                newEmbed.setTitle("Successfully pulled " + stock + " " + name + "!");
                            } else if (action == "add") {
                                in_slice.stock = in_slice.stock + stock;
                                newEmbed.setTitle("Successfully added " + stock + " " + name + "!");
                            } else if (action == "set") {
                                in_slice.stock = stock;
                                newEmbed.setTitle("Successfully reset " + name + " stocks to " + stock + "!")
                            }
                            in_slice.date = Math.floor(Date.now()/1000);
                            newEmbed.setDescription("New stock: " + in_slice.stock + " " + name);
                            fac.last = Math.floor(Date.now()/1000);
                            await database.replaceOne({ id: fac.id }, fac);

                            await inter.update({components: [], embeds: toEmbed(fac).concat([newEmbed])});
                        }
                    }).catch((e) => console.log(e));
                } else {
                    await interaction.editReply(name + " is not a listed item in your facility!");
                }
                
            } else {
                await interaction.editReply("Item " + item + " is not a valid item!");
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
