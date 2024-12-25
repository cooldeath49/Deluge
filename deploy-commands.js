const {
  REST,
  Routes,
  CommandInteraction,
} = require("discord.js");
let config;
let TOKEN;
let APPID;
let GUILDID;
try {
  config = require("./config.json");
  TOKEN = config.TOKEN;
  APPID = config.APPID;
  GUILDID = config.GUILDID;
} catch(error) {
  console.log("Detected running in Railway, using environment variables...");
  TOKEN = process.env.TOKEN;
  APPID = process.env.APPID;
  GUILDID = process.env.GUILDID;
}
const rest = new REST().setToken(TOKEN);
const fs = require("node:fs");
const path = require("node:path");
const foldersPath = path.join(__dirname, "commands"); //Creates a path to the commands folder
const cmdFolders = fs.readdirSync(foldersPath); //reads 'foldersPath' and returns a table of all contents
const commands = []

for (const folder of cmdFolders) { //iterate through all folder
  const cmdPath = path.join(foldersPath, folder); //Create path to each object in folder
  const cmdFiles = fs.readdirSync(cmdPath); //Returns table to each object
  for (const file of cmdFiles) { //Iterate through file
    const filePath = path.join(cmdPath, file); //Create path to file
    const cmd = require(filePath); //call require() on file 
    if ('data' in cmd && 'execute' in cmd) {
      commands.push(cmd.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}


(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      // Routes.applicationGuildCommands(APPID, GUILDID),
      Routes.applicationCommands(APPID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
    
  }
})();