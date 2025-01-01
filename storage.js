const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  ActionRow

} = require('discord.js');
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://arthuritisyou:luoyuan1@deluge.nxwj2.mongodb.net/?retryWrites=true&w=majority&appName=Deluge";

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");
let global_id = 0;
let global_count = 0;

(async function () {
  console.log("Storage initializing...");
  let counter = await database.findOne({counter: "counter"});
  if (!counter) {
    counter = {
      counter: "counter",
      global_id: 0,
      count: 0,
      _id: null,
    }

    await database.insertOne(counter);
  }
  global_id = counter.global_id;
  global_count = counter.count;
  console.log("Storage finished initializing asynchronous data!");
})();

const facs_name_map = [
  "Linn of Mercy",
  "Deadlands",
  "Marban Hollow",
  "Farranac Coast"
]

function get_name_index(str) {
  return facs_name_map.indexOf(str);
}

/*
0: The Linn of Mercy
1: The Deadlands
2: Marban Hollow
3: Farranac Coast
*/

//Given a set of parameters, adds a facility to the list and returns its object

var hexes1 = [];
// var hexes2 = [];
let newhexes1 = [
  ["Linn of Mercy", 
    "The Long Whine",
    "Rotdust",
    "Lathair",
    "Outwich Ranch",
    "Fort Duncan",
    "The Prairie Bazaar",
    "The Last Grove",
    "The Crimson Gardens",
    "The First Coin",
    "Hardline",
    "Ulster Falls"],

    ["Deadlands", 
    "Callahan's Gate",
    "Iron's End",
    "The Spine",
    "Liberation Point",
    "Abandoned Ward",
    "Callahan's Boot",
    "The Salt March",
    "The Salt Farms",
    "The Pits",
    "Brine Glen",
    "Sun's Hollow"],

    ["Marban Hollow", 
    "Sanctum",
    "Lockheed",
    "The Spitrocks",
    "Maiden's Veil",
    "Oster Wall",
    "Mox",
    "Checkpoint Bua"],

    ["Farranac Coast", 
    "The Jade Cove",
    "Terra",
    "The Bone Haft",
    "Mara",
    "The Pleading Wharf",
    "Transient Valley",
    "Scarp of Ambrose",
    "Huskhollow",
    "Macha's Keening",
    "Victa",
    "Scythe"],
];

var hexes1array = new Map()
  .set("Linn of Mercy", [
    "The Long Whine",
    "Rotdust",
    "Lathair",
    "Outwich Ranch",
    "Fort Duncan",
    "The Prairie Bazaar",
    "The Last Grove",
    "The Crimson Gardens",
    "The First Coin",
    "Hardline",
    "Ulster Falls"
  ],)
  .set("Deadlands", [
    "Callahan's Gate",
    "Iron's End",
    "The Spine",
    "Liberation Point",
    "Abandoned Ward",
    "Callahan's Boot",
    "The Salt March",
    "The Salt Farms",
    "The Pits",
    "Brine Glen",
    "Sun's Hollow"
  ],)
  .set("Marban Hollow", [
    "Sanctum",
    "Lockheed",
    "The Spitrocks",
    "Maiden's Veil",
    "Oster Wall",
    "Mox",
    "Checkpoint Bua"
  ],)
  .set("Farranac Coast", [
    "The Jade Cove",
    "Terra",
    "The Bone Haft",
    "Mara",
    "The Pleading Wharf",
    "Transient Valley",
    "Scarp of Ambrose",
    "Huskhollow",
    "Macha's Keening",
    "Victa",
    "Scythe",
  ],)

let artilleryItems = ["120mm", "150mm", "300mm"];

class productionIterator { //anonymous class containing methods to parse and iterate
  //overkill...? probably, lol
  table;
  quantity_table;
  constructor(table, quantity) {
    this.table = table;
    if (quantity) {
      this.quantity_table = quantity;
    } else {
      this.quantity_table = [];
      for (let ele in table) {
        this.quantity_table.push([table[ele], 0, Math.floor(Date.now()/1000)]);
      }
    }
  }

  add(item) {
    this.table.push(item);
    this.quantity_table.push([item, 0, Math.floor(Date.now()/1000)]);
  }

  set(arr) {
    this.table = arr;
    this.quantity_table = [];
    for (let ele in this.table) {
      this.quantity_table.push([this.table[ele], 0, Math.floor(Date.now()/1000)]);
    }
  }

  getString() {
    let str = "";
    if (this.table.length > 0) {
      for (let i = 0; i< this.table.length; i++) {
        if (i == this.table.length - 1) {
          str = str + this.table[i];
        } else {
          str = str + this.table[i] + ", ";
        }
      }
      return str;
    } else {
      return "None listed";
    }
   
  }
}

class Facility {
  hex;
  town;
  letter;
  number;
  regiment;
  contact;
  nickname;
  field;
  relative;
  id;
  primary;
  secondary;
  password;

  productionIterator = class { //anonymous class containing methods to parse and iterate
    //overkill...? probably, lol
    table;
    quantity_table;
    constructor(table, quantity) {
      this.table = table;
      if (quantity) {
        this.quantity_table = quantity;
      } else {
        this.quantity_table = [];
        for (let ele in table) {
          this.quantity_table.push([table[ele], 0, Math.floor(Date.now()/1000)]);
        }
      }
    }

    add(item) {
      this.table.push(item);
      this.quantity_table.push([item, 0, Math.floor(Date.now()/1000)]);
    }

    set(arr) {
      this.table = arr;
      this.quantity_table = [];
      for (let ele in this.table) {
        this.quantity_table.push([this.table[ele], 0, Math.floor(Date.now()/1000)]);
      }
    }

    getString() {
      let str = "";
      if (this.table.length > 0) {
        for (let i = 0; i< this.table.length; i++) {
          if (i == this.table.length - 1) {
            str = str + this.table[i];
          } else {
            str = str + this.table[i] + ", ";
          }
        }
        return str;
      } else {
        return "None listed";
      }
     
    }
  }

  constructor(args, id) {

    this.hex = args[0];
    this.town = args[1];
    this.letter = args[2];
    this.number = args[3];
    this.regiment = args[4];
    this.contact = args[5];
    this.nickname = args[6];
    this.field = args[7];
    this.relative = args[8];
    this.id = args[9] ?? id;
    this.primary = args[10] ?? new this.productionIterator([]);
    this.secondary = args[11] ?? new this.productionIterator([]);
  }

  update() {
    lastupdated = Date.now();
  }

  toString() {
    if (this.field) {
      return this.town + " " + this.field + " (" + this.letter + this.number.toString() + "): \"" + this.nickname + "\" run by " + this.regiment + " (" + this.contact + ")";
    } else {
      return this.relative + " of " + this.town + " (" + this.letter + this.number.toString() + "): \"" + this.nickname + "\" run by " + this.regiment + " (" + this.contact + ")";
    }
  }

  toEmbed() {
    let embeds = [];
    let embed = new EmbedBuilder()
    .addFields({name: "Lead Contact", value: this.contact, inline: true})
    if (this.regiment) {
      embed.addFields({name: "Regiment", value: this.regiment, inline: true});
    } else {
      embed.addFields({name: "Regiment", value: "N/A", inline: true});
    }
    embed.addFields({name: "ID", value: this.id.toString(), inline: true});
    if (this.password) {
      embed.setDescription("This registration is password protected :lock:")
    }
    embed.addFields(
      // { name: '\u200B', value: '\u200B' },
      { name: "Hex", value: this.hex, inline: true},
      { name: "Town", value: this.town, inline: true },
      { name: "Grid", value: this.letter + this.number.toString(), inline: true },
    )
    if (this.field) {
      embed.setTitle(this.town + " " + this.field + ": \"" + this.nickname + "\"")
    } else {
      if (this.relative == "Zero") {
        embed.setTitle(this.town + ": \"" + this.nickname + "\"")
      } else {
        embed.setTitle(this.relative + " of " + this.town + ": \"" + this.nickname + "\"")
      }
    }
    embeds.push(embed);
    embed.addFields(
      // {name: '\u200B', value: '\u200B' },
      {name: "Primary Production", value: this.primary.getString(), inline: true},
      {name: "Secondary Production", value: this.secondary.getString(), inline: true}
    );

    if (this.primary.length > 0) {
      let primaryEmbed = new EmbedBuilder()
      .setTitle("Primary Production Quantities")
      for (let i = 0; i < primary.length; i++) {
        primaryEmbed.addFields({name: primary[i][0], value: primary[i][1] + " items - *last updated by the owner <t:" + primary[i][2] + ":R>*"});
      }
      embeds.push(primaryEmbed);
    }

    if (this.secondary.length > 0) {
      let secondary_quantity = this.secondary.quantity_table;
      let secondaryEmbed = new EmbedBuilder()
      .setTitle("Secondary Production Quantities")
      for (let i = 0; i < secondary_quantity.length; i++) {
        secondaryEmbed.addFields({name: secondary_quantity[i][0], value: secondary_quantity[i][1] + " items - *last updated <t:" + secondary_quantity[i][2] + ":R>*"});
      }
      embeds.push(secondaryEmbed); 
    }

    
    return embeds;
  }

  toEmbedData() {
    return [
      this.hex,
      this.town,
      this.letter,
      this.number,
      this.regiment,
      this.contact,
      this.nickname,
      this.field,
      this.relative,
      this.id,
      this.primary,
      this.secondary,
    ]
  }
}

function getTooltip(fac, state) {
  if (state == "primary") {
    if (fac.primary.length > 0) {
      let str = "";
      for (ind in fac.primary) {
        if (ind == fac.primary.length - 1) {
          str = str + fac.primary[ind][0];
        } else {
          str = str + fac.primary[ind][0] + ", ";
        }
      }
      return str;
    } else {
      return "Not listed";
    }
  } else {
    if (fac.secondary.length > 0) {
      let str = "";
      for (ind in fac.secondary) {
        if (ind == fac.secondary.length - 1) {
          str = str + fac.secondary[ind][0];
        } else {
          str = str + fac.secondary[ind][0] + ", ";
        }
      }
      return str;
    } else {
      return "Not listed";
    }
  }
  
}

async function add(args) {
  global_id++;
  global_count++;

  await database.updateOne({counter: "counter"}, {$set: {
    global_id: global_id,
    count: global_count,
  }});
  let fac = {
    _id: null,
    hex: args[0],
    town: args[1],
    letter: args[2],
    number: args[3],
    regiment: args[4],
    contact: args[5],
    nickname: args[6],
    field: args[7],
    relative: args[8],
    primary: [],
    // primary_quantity: [],
    secondary: [],
    // secondary_quantity: [],
    password: null,
    id: args[9] ?? global_id,
  }
  console.log("Adding a facility to mongodb... " + global_id);
  let insert = await database.insertOne(fac);
  if (insert.acknowledged) {
    console.log("Successfully added, " + insert.insertedId);
    return fac;
  } else {
    console.log("Failed to insert");
    return null;
  }
}

function toEmbed(fac) {
  let embeds = [];
  let embed = new EmbedBuilder()
  .addFields({name: "Lead Contact", value: fac.contact, inline: true})
  if (fac.regiment) {
    embed.addFields({name: "Regiment", value: fac.regiment, inline: true});
  } else {
    embed.addFields({name: "Regiment", value: "N/A", inline: true});
  }
  embed.addFields({name: "ID", value: fac.id.toString(), inline: true});
  if (fac.password) {
    embed.setDescription("This registration is password protected :lock:")
  }
  embed.addFields(
    // { name: '\u200B', value: '\u200B' },
    { name: "Hex", value: fac.hex, inline: true},
    { name: "Town", value: fac.town, inline: true },
    { name: "Grid", value: fac.letter + fac.number.toString(), inline: true },
  )
  if (fac.field) {
    embed.setTitle(fac.town + " " + fac.field + ": \"" + fac.nickname + "\"")
  } else {
    if (fac.relative == "Zero") {
      embed.setTitle(fac.town + ": \"" + fac.nickname + "\"")
    } else {
      embed.setTitle(fac.relative + " of " + fac.town + ": \"" + fac.nickname + "\"")
    }
  }
  embeds.push(embed);
  embed.addFields(
    // {name: '\u200B', value: '\u200B' },
    {name: "Primary Production", value: getTooltip(fac, "primary"), inline: true},
    {name: "Secondary Production", value: getTooltip(fac, "secondary"), inline: true}
  );

  if (fac.primary.length > 0) {
    let primaryEmbed = new EmbedBuilder()
    .setTitle("Primary Production Quantities")
    for (let i = 0; i < fac.primary.length; i++) {
      primaryEmbed.addFields({name: fac.primary[i][0], value: fac.primary[i][1] + " items - *last updated by the owner <t:" + fac.primary[i][2] + ":R>*"});
    }
    embeds.push(primaryEmbed);
  }

  if (fac.secondary.length > 0) {
    let secondaryEmbed = new EmbedBuilder()
    .setTitle("Secondary Production Quantities")
    for (let i = 0; i < fac.secondary.length; i++) {
      secondaryEmbed.addFields({name: fac.secondary[i][0], value: fac.secondary[i][1] + " items - *last updated by the owner <t:" + fac.secondary[i][2] + ":R>*"});
    }
    embeds.push(secondaryEmbed); 
  }

  
  return embeds;
}

class AllContainer {
  global_count;
  old_global_id;
  hexes;
  facility_id_tracker;
  hexes_str_array;


  constructor() {
    this.hexes = [];
    this.facility_id_tracker = [];
    this.global_count = 0;
    this.hexes_str_array = [];
  }
  
  //Runs in O(n), returns hex object
  get_hex(hex) {
    for (let ele in this.hexes) {
      if (this.hexes[ele].name == hex) {
        return this.hexes[ele];
      }
    }
    return null;
  }
  //Runs in O(n^2), returns town object 
  get_town(name) {
    for (let ele in this.hexes) {
      return this.hexes[ele].get_town(name);
    }
    return null; 
  }

  /*add(args) {
    let fac = {
      _id: null,
      hex: args[0],
      town: args[1],
      letter: args[2],
      number: args[3],
      regiment: args[4],
      contact: args[5],
      nickname: args[6],
      field: args[7],
      relative: args[8],
      primary: [],
      primary_quantity: [],
      secondary: [],
      secondary_quantity: [],
      password: null,
      id: args[9] ?? global_id++,
    }
    console.log("Adding a facility to mongodb...");
    let insert = database.insertOne(fac);
    if (insert.acknowledged) {
      console.log("Successfully added, " + insert.insertedId);
    } else {
      console.log("Failed to insert");
    }
    return fac;
  }*/

  hexes_tostring() {
    for (let ele in this.hexes) {
      this.hexes_str_array.push(this.hexes[ele].name);
    }
  }
}

class Hex {
  name;
  towns;
  fac_count;

  constructor(name) {
    this.name = name;
    this.towns = [];
    this.fac_count = 0;
  }
  //Runs in O(n), returns town object associated with the town name
  get_town(name) {
    for (let ele in this.towns) {
      if (this.towns[ele].name == name) {
        return this.towns[ele];
      }
    }
    return "Couldn't find specified town " + name;
  }

  add(fac) {
    let town = this.get_town(fac.town);
    town.add(fac);
    this.fac_count++;
  }
}

class Town {
  name;
  facilities;
  fac_count;

  constructor(name) {
    this.name = name;
    this.facilities = [];
    this.fac_count = 0;
  }
  //Runs in O(n), returns facility object associated with id
  search_fac(id) {

  }

  add(fac) {
    this.facilities.push(fac);
    this.fac_count++;
  }
}

let allfacs = new AllContainer();


hexes1array.forEach((value, key, map) => 
  {hexes1.push(new StringSelectMenuOptionBuilder()
  .setLabel(key)
  .setDescription(key)
  .setValue(key)
  );

  let hex = new Hex(key);
  for (let town in value) {
    hex.towns.push(new Town(value[town]));
  };
  allfacs.hexes.push(hex);
}
);
allfacs.hexes_tostring();

const letter_map = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
]
const number_map = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]
const keypad_map = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
]

const testhex = [
  {
    label: "Speaking Woods",
    description: "Speaking Woods",
    value: "Speaking Woods",
  },
  {
    label: "Basin Sionnach",
    description: "Basin Sionnach",
    value: "Basin Sionnach",
  },
  {
    label: "Viper Pit",
    description: "Viper Pit",
    value: "Viper Pit",
  },
  {
    label: "Morgens Crossing",
    description: "Morgens Crossing",
    value: "Morgens Crossing",
  },
  {
    label: "Oarbreaker Isles",
    description: "Oarbreaker Isles",
    value: "Oarbreaker Isles",
  },
  {
    label: "Stonecradle",
    description: "Stonecradle",
    value: "Stonecradle",
  },
  {
    label: "Callahans Passage",
    description: "Callahans Passage",
    value: "Callahans Passage",
  },
  {
    label: "Weathered Expanse",
    description: "Weathered Expanse",
    value: "Weathered Expanse",
  },
  {
    label: "Godcrofts",
    description: "Godcrofts",
    value: "Godcrofts",
  },
  {
    label: "Stlican Shelf",
    description: "Stlican Shelf",
    value: "Stlican Shelf",
  },
  {
    label: "Fishermans Row",
    description: "Fishermans Row",
    value: "Fishermans Row",
  },
  {
    label: "Kings Cage",
    description: "Kings Cage",
    value: "Kings Cage",
  },
  {
    label: "The Clahstra",
    description: "The Clahstra",
    value: "The Clahstra",
  },
  {
    label: "Tempest Island",
    description: "Tempest Island",
    value: "Tempest Island",
  },
  {
    label: "Westgate",
    description: "Westgate",
    value: "Westgate",
  },
]
const hexes2 = [{
  label: "Loch Mor",
  description: "Loch Mor",
  value: "Loch Mor",
},
{
  label: "The Drowned Vale",
  description: "The Drowned Vale",
  value: "The Drowned Vale",
},
{
  label: "Endless Shore",
  description: "Endless Shore",
  value: "Endless Shore",
},
{
  label: "Stema Landing",
  description: "Stema Landing",
  value: "Stema Landing",
},
{
  label: "Sableport",
  description: "Sableport",
  value: "Sableport",
},
{
  label: "Umbral Wildwood",
  description: "Umbral Wildwood",
  value: "Umbral Wildwood",
},
{
  label: "Allods Bight",
  description: "Allods Bight",
  value: "Allods Bight",
},
{
  label: "The Fingers",
  description: "The Fingers",
  value: "The Fingers",
},
{
  label: "Origin",
  description: "Origin",
  value: "Origin",
},
{
  label: "The Heartlands",
  description: "The Heartlands",
  value: "The Heartlands",
},
{
  label: "Shackled Chasm",
  description: "Shackled Chasm",
  value: "Shackled Chasm",
},
{
  label: "Reavers Pass",
  description: "Reavers Pass",
  value: "Reavers Pass",
},
{
  label: "Ash Fields",
  description: "Ash Fields",
  value: "Ash Fields",
},
{
  label: "Great March",
  description: "Great March",
  value: "Great March",
},
{ 
  label: "Terminus",
  description: "Terminus",
  value: "Terminus",
},
{
  label: "Red River",
  description: "Red River",
  value: "Red River",
},
{
  label: "Acrithia",
  description: "Acrithia",
  value: "Acrithia",
},
{
  label: "Kalokai",
  description: "Kalokai",
  value: "Kalokai",
},
]


function coord(fac) {
  return fac.hex + "-" + fac.letter + fac.letternumber + "k" + fac.grid;
}

module.exports = {
  allfacs: allfacs,
  add: add,
  toEmbed: toEmbed,
  getTooltip: getTooltip,
  hexes1: hexes1,
  hexes1array: hexes1array,
  newhexes1: newhexes1,
  hexes2: hexes2,
  testhex: testhex,
  number_map: number_map,
  letter_map: letter_map,
  Facility: Facility,
  coord: coord,
  facs_name_map: facs_name_map,
  get_name_index: get_name_index,
  keypad_map: keypad_map,
  artilleryItems: artilleryItems,
}
