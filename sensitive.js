//For the sole sake of retrieving sensitive information such as tokens and IDs
let config;
let TOKEN;
let uri;
let APPID;
let GUILDID;
let DELUGE_TOKEN;
let DELUGE_APPID;


try {
  config = require("./config.json");
  TOKEN = config.TOKEN;
  APPID = config.APPID;
  GUILDID = config.GUILDID;
  uri = config.URL;
  DELUGE_TOKEN = config.DELUGE_TOKEN;
  DELUGE_APPID = config.DELUGE_APPID;
} catch(error) {
  console.log("Detected running in Railway, using environment variables...");
  TOKEN = process.env.TOKEN;
  uri = process.env.MONGO_URL;
  APPID = process.env.APPID;
  GUILDID = process.env.GUILDID;
}

console.log("Variables are the following: \nTOKEN: " + TOKEN + "\nURI: " + uri + "\nAPPID: " + APPID + "\nGUILDID: " + GUILDID);

module.exports = {
  TOKEN: TOKEN,
  APPID: APPID,
  GUILDID: GUILDID,
  uri: uri,
  DELUGE_TOKEN: config.DELUGE_TOKEN,
  DELUGE_APPID: config.DELUGE_APPID
}