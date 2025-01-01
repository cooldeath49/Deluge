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

/*async function run() {
  try {
    let database = mongo_client.db("sample_mflix");
    let movies = database.collection("movies");

    let query = {title: "Back to the Future"};
    let movie = await movies.findOne(query);

    console.log(movie);


  } finally {
    await mongo_client.close();
  }
}

run().catch(console.dir);*/

// import Foxhole from 'foxhole-client';
const fs = require("node:fs");
const path = require("node:path");
const {
  TOKEN
} = require("./storage.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(TOKEN);
