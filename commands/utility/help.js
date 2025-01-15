const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Display help information about Deluge")
  .addStringOption((option) => option
        .setName("command")
        .setDescription("Enter a command for specific help information")
    )

let default_embed = new EmbedBuilder()
.setTitle("Help")
.setDescription("Welcome to the Deluge bot, a registry bot that lets Wardens better organize facility logistics! Deluge contains a large database that houses various facilities, all logged by facility players. \nTo get started, check out the commands below.\nFor specific help on a command, run /help followed by the command name.")
.addFields(
    {
        name: "/listfac (OPTIONAL hex)", value: "Lists registered facilities across all hexes and towns. If a hex is specified, lists registered facilities only in that hex."
    },
    {
        name: "/lookup (id)", value: "Look up detailed information about a facility registry given its id."
    },
    {
        name: "/addfac", value: "You can register a facility using this command! "
    },
    {
        name: "/editfac (id)", value: "Edit a registered facility given its id. Use this command to edit contact info, production info, etc."
    },
    {
        name: "/help", value: "Opens up the help display. You may enter this command at any time."
    },
    {
        name: "/restock (id) (item) (action) (stock) (OPTIONAL password)", value: "Restocks an import or export item in your facility."
    }
);

module.exports = {
    data: data,
    async execute(interaction) {
        let cmd = interaction.options.getString("command")
        let target = default_embed;
        if (cmd) {
            switch (cmd) {
                case "listfac": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /listfac [OPTIONAL hex]")
                    .setDescription("Lists all facilities in the registry through a series of clickable pages. If specified a hex via the *hex* argument, will list only facilities registered in that hex.\nThe hex argument must be a valid hex, however some spellchecking is possible.")
                    .addFields({
                        name: "Examples", value: "/listfac\n/listfac Farranac\n/listfac stlican shelf\n/listfac morgans"
                    })
                    break;
                }
                case "addfac": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /addfac")
                    .setDescription("Prompts the user to register a new facility. The user will be prompted with several questions outlining key information about the facility, such as location, contact info, and production services.")
                    break;
                }
                case "editfac": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /editfac [id]")
                    .setDescription("Prompts the user to edit a facility given its *id*. Facility id must be valid.\nPassword-locked facilities will prompt the user for its password.\nAll registry fields may be changed using this command.")
                    .addFields({
                        name: "Examples", value: "/editfac 5\n/editfac 1\n/editfac 10"
                    })
                    break;
                }
                case "lookup": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /lookup [id]")
                    .setDescription("Looks up a facility registry in the database given its *id*, and returns facility information. Facility id must be valid.")
                    .addFields({
                        name: "Examples", value: "/lookup 5\n/lookup 1\n/lookup 10"
                    })
                    break;
                }
                case "categories": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /categories")
                    .setDescription("Lists all production items, categories, and vehicle services.")
                    break;
                }
                case "restock": {
                    target = new EmbedBuilder()
                    .setTitle("Usage: /restock [id] [item] [action] [stock] [OPTIONAL password]")
                    .setDescription(`Changes the stock of an import or export item in a facility, given its *id*.
                        Specify the item using the *item* parameter. This must be a valid item in either the facility's import or export sections.
                        Specify how to modify the stock using the *action* parameter: Add to the stock, Pull from the stock, or Set the stock amount by hand.
                        Specify how much using the *stock* parameter.
                        If your facility is password locked, the last parameter *password* is required in order to perform this action.`)
                    .addFields({
                        name: "Examples", value: `/restock 4 concrete add 500\n/restock 13 scrap pull 5000\n/restock 17 120mm set 1000`
                    })
                    break;
                }
            }
        }
        await interaction.reply({embeds: [target]});
    }
}
