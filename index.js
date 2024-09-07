const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Discord,
  Attachment,
  AttachmentBuilder,
  MessagePayload,
  Message,
  REST,
  Routes,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const storage = require('./storage.js');
const allfacs = storage.allfacs;
const allhexes = storage.allhexes;
const Facility = storage.Facility;
const config = require("./config.json");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

class Coordinates {
  grid;
  keypad;
  constructor(x, y) {
    this.grid = x;
    this.keypad = y;
  }
  
}
const attach = new AttachmentBuilder("./pinagain.png");

client.commands = new Collection();
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


const foldersPath = path.join(__dirname, "commands"); //Creates a path to the commands folder
const cmdFolders = fs.readdirSync(foldersPath); //reads 'foldersPath' and returns a table of all contents

for (const folder of cmdFolders) { //iterate through all folder
  const cmdPath = path.join(foldersPath, folder); //Create path to each object in folder
  const cmdFiles = fs.readdirSync(cmdPath); //Returns table to each object
  for (const file of cmdFiles) { //Iterate through file
    const filePath = path.join(cmdPath, file); //Create path to file
    const cmd = require(filePath); //call require() on file 
    if ('data' in cmd && 'execute' in cmd) {
      client.commands.set(cmd.data.name, cmd); //key = commandname, value = cmd
      console.log("Added command " + cmd.data.name);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

function argumentReturn(text) { //Returns arguments in a table given a line of text
  console.log(text);
  let counter = 1;
  let table = [];
  for (let i = 1; i < text.length; i++) {
    if (text.charAt(i) == ' ' && i - counter > 3) {
      let str = text.substring(counter, i);
      table.push(str.trim());
      counter = i + 1;
    }
    if (i == text.length - 1) {
      let str = text.substring(counter);
      table.push(str);
    }
  }
  return table;
}

function textParser(msg, text) { //Parse through text for commands
  let table = argumentReturn(text);
  let cmd = table[0].toLowerCase();
  for (let i = 0; i < table.length; i++) {
    console.log("arg" + i + " " + table[i]);
  }
  if (cmd == "listfac") {
    if (allfacs.length == 0) {
      msg.reply("No facilities in list!");
      return;
    } else {
      let str = "**All Facilities**\n";
      for (let i = 0; i < allfacs.length; i++) {
        // str = str + printFac(allfacs[i]) + "\n";
      }
      msg.reply(str);
    }
  } else if (cmd == "addfac") {
    let keypadindex = text.search('-');
    
    if (table.length == 1) {
      msg.reply("Command usage: >addfac `HexName-KeypadEntry`");
      return 
    } else if (keypadindex == -1) {
      msg.reply("Improper command: facility coordinates must be of the form `HexName-KeypadEntry`\n");
      return;
    } else {
      let hexindex = cmd.length + 2;
      let hex = text.substring(hexindex, keypadindex);
      let keypad = text.substring(keypadindex + 1);

      let gridindex = keypad.search('k');
      let grid = keypad.substring(gridindex + 1);
      let letter = keypad.substring(0, 1).toUpperCase();
      let letternumber = keypad.substring(1, gridindex);
      if (allhexes.includes(hex)) {
        console.log(hex + " " + letter + letternumber + "k" + grid);
        let fac = addFacility(hex, letter, letternumber, grid);
        msg.reply("Added facility in " + hex + "-" + keypad + " ID=" + fac.id + ", use >editfac to edit details");
      } else {
        msg.reply("Could not find target hex \"" + hex + "\"");
      }
      
    }
    
  } else if (cmd == "editfac") {
    
  }
  
}

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    let cmd = interaction.client.commands.get(interaction.commandName);

    if (!cmd) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await interaction.deferReply();
      await cmd.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }

  }

})

client.on("messageCreate", (msg) => {
  const content = msg.content;
  if (msg.author != client.user) {
    if (content.length > 1 && content.length < 200 && content.charAt(0) == ">") {
      textParser(msg, content.trim());
      
      
      // msg.reply("gotem");
      // msg.reply({
      //   content: "get shit on",
      //   files: [attach],
      // });
    }
  }
});

client.login(config.TOKEN);