const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const storage = require("../../storage.js");
const {MongoClient} = require("mongodb");
const {uri} = require("../../sensitive.js");

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");

const paste_regex = /([a-zA-Z ]+)-([A-Q])([1-9]|1[0-5])k([1-9])/

const data = new SlashCommandBuilder()
  .setName("shellsnearme")
  .setDescription("Quickly locate shell facilities near your location")
  .addStringOption((option) => option
    .setName("coordinates")
    .setDescription('Paste click-copied coordinates of your location from the map')
    .setRequired(true)
  );

/*
let parse = submitted.fields.getTextInputValue("paste text");

    let groups = parse.match(paste_regex);
    if (groups) {
      console.log(groups[0], groups[1], groups[2], groups[3], groups[4]);
    } else {
      console.log("incorrectly formatted pasted coordinates");
    }


    
const paste_regex = /([a-zA-Z ]+)-([A-Q])([1-9]|1[0-5])k([1-9])/
      */


module.exports = {
  data: data,
  async execute(interaction) {
    await interaction.deferReply();
    let target = interaction.options.getString("coordinates");
    let groups = target.match(paste_regex);
    if (groups) {
        let hex = groups[1];
        let letter = groups[2];
        let number = groups[3];

        console.log(hex, letter, number);

        if (storage.hexes1only.indexOf(hex) >= 0 &&
        letter >= "A" && letter <= "R" &&
        number >= 1 && number <= 15
        ) {
            let embed = new EmbedBuilder()
            .setTitle("Facilities Near " + target);
            let total_found = 0;
            let must_find = 5;
            let obj = {
                x: storage.letter_map.indexOf(letter),
                y: storage.number_map.indexOf(parseInt(number)),
            }
            
            let hex_facs = await database.find({hex: hex}).toArray();
            //array of all facilities in hex
            hex_facs = hex_facs.map((fac) => { //for each fac, map it to [result, fac]
                let fac_obj = {
                    x: storage.letter_map.indexOf(fac.letter),
                    y: storage.number_map.indexOf(fac.number),
                };

                let result = storage.directions(obj, fac_obj);
                return [result, fac];
            }
            ).sort((first, second) => first[0].mag - second[0].mag); //sort by the facility's magnitude

            for (let entry of hex_facs) {
                if (total_found < must_find) {
                    total_found++;
                    embed.addFields( {
                        name: entry[0].mag + "m " + entry[0].direction + ", in " + entry[1].town,
                        value: "\"" + entry[1].nickname + "\" - " + 
                                    storage.getTooltip(entry[1], "primary") + " - " + entry[1].contact + " - " + entry[1].id + "\n",
                    });
                } else {
                    break;
                }
                
            }
            await interaction.followUp({embeds: [embed]});
        } else {
            await interaction.followUp("Invalid coordinate format, please ensure you're pasting coordinates that were Ctrl+Click'd from the map!");
        }
    }
  }
}
