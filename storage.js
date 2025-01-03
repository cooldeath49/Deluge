const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  ActionRow

} = require('discord.js');
const { MongoClient } = require("mongodb");
const {uri} = require("./sensitive.js");

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");
let global_id = 0;

(async function () {
  console.log("Storage initializing...");
  let counter = await database.findOne({counter: "counter"});
  if (!counter) {
    counter = {
      counter: "counter",
      global_id: 0,
      _id: null,
    }

    await database.insertOne(counter);
  }
  global_id = counter.global_id;
  console.log("Storage finished initializing asynchronous data!");
})();
/*
0: The Linn of Mercy
1: The Deadlands
2: Marban Hollow
3: Farranac Coast
*/

//Given a set of parameters, adds a facility to the list and returns its object
// var hexes2 = [];
const hexes1 = [
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

    ["Speaking Woods",
      "Tine",
      "The Filament",
      "Stem",
      "Hush",
      "Inari Base",
      "Wound",
      "Fort Blather",
      "Sotto Bank"
    ],

    ["Basin Sionnach",
      "Cuttail Station",
      "Stoic",
      "Lamplight",
      "Basinhome",
      "The Den",
      "Sess",
    ],

    ["Howl County",
      "Great Warden Dam",
      "Fort Red",
      "Sickleshire",
      "Little Lamb",
      "Fort Rider",
      "Teller Farm",
      "Hungry Wolf",
      "Slipgate Outpost"
    ],

    ["Reaching Trail",
      "Brodytown",
      "Limestone Holdfast",
      "Dwyerstown",
      "Elksford",
      "Nightchurch",
      "Reprieve",
      "Harpy",
      "Fort MacConaill",
      "Mousetrap",
      "The Ark",
      "Ice Ranch"
    ],
    ["Callums Cape",
      "Callums Keep",
      "Camp Hollow",
      "Holdout",
      "Lookout",
      "Ire",
      "Scout's Jest",
      "Naofa"
    ],
    ["The Moors",
      "Ogmaran",
      "Borderlane",
      "Luch's Workshop",
      "Morrighan's Grave",
      "Wiccwalk",
      "MacConmara Barrows",
      "Gravekeeper's Holdfast",
      "The Wind Hills",
      "The Cut",
      "Headstone",
      "The Spade",
      "Reaching River"
    ],
    ["Callahan's Passage",
      "Lochan Berth",
      "Cragstown",
      "White Chapel",
      "The Procession",
      "The Latch",
      "Overlook Hill",
      "The Crumbling Passage",
      "Crumbling Post",
      "Scath Passing",
      "Solas Gorge",
    ],
    ["Viper Pit",
      "Kirknell",
      "Serenity's Blight",
      "Earl Crowley",
      "Fleck Crossing",
      "Moltworth",
      "Blackthroat",
      "The Friars",
      "Fort Viper"
    ],
    ["Clanshead Valley",
      "The King",
      "Sweetholt",
      "Fort Esterwild",
      "The Pike",
      "Fort Ealar",
      "Fallen Crown",
      "Fort Windham",
    ],
    ["Morgen's Crossing",
      "Allsight",
      "Bastard's Block",
      "Lividus",
      "Callum's Descent",
      "Quietus",
      "Eversus",
    ],
    ["Weathered Expanse",
      "The Weathering Halls",
      "Shattered Advance",
      "Wightwalk",
      "Huntsfort",
      "Spirit Watch",
      "Foxcatcher",
      "Necropolis",
      "Crow's Nest",
      "Frostmarch"
    ],
    ["Stonecradle",
      "Buckler Sound",
      "The Reach",
      "Trammel Pool",
      "Fading Lights",
      "The Cord",
      "The Long Fast",
      "The Heir's Knife",
      "World's End",
      "The Dais",
    ],
    ["Nevish Line",
      "The Scrying Belt",
      "Mistle Shrine",
      "Grief Mother",
      "Tomb Father",
      "Blackcoat Way",
      "Blinding Stones",
      "Unruly"
    ]
];

const hexes1only = hexes1.map((element) => element[0]);

const hexesgraph = { //TODO finish this graph oh god oh god oh god oh god oh god oh god
  "Farranac Coast": ["Stonecradle", ]
}

let artilleryItems = ["120mm", "150mm", "300mm"];

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function radToDeg(rad) {
  return rad / (Math.PI / 180);
}

//magnitude between two coordinates, assumes keypad-transformed coordinates, returns an object with mag and direction field
//@param first: pasted location
//@param second: facility location
function directions(first, second) {
  let x = second.x - first.x;
  let y = second.y - first.y;

  let mag = Math.ceil( (Math.sqrt(x*x + y*y) * 125)/10) * 10;
  
  let deg = radToDeg(Math.atan(Math.abs(y)/Math.abs(x)));
  let direction;
  if (x > 0) { //East
    if (y < 0) { //North
      if (deg < 30) {
        direction = "East";
      } else if (deg < 60) {
        direction = "Northeast";
      } else {
        direction = "North";
      }
    } else { //South
      if (deg < 30) {
        direction = "East";
      } else if (deg < 60) {
        direction = "Southeast";
      } else {
        direction = "South";
      }
    }
  } else {
    if (y < 0) { //North
      if (deg < 30) {
        direction = "West";
      } else if (deg < 60) {
        direction = "Northwest";
      } else {
        direction = "North";
      }
    } else { //South
      if (deg < 30) {
        direction = "West";
      } else if (deg < 60) {
        direction = "Southwest";
      } else {
        direction = "South";
      }
    }
  }

  return {
    mag: mag,
    direction: direction
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

async function add(fac) {
  global_id++;

  await database.updateOne({counter: "counter"}, {$set: {
    global_id: global_id,
  }});
  
  fac._id = null;
  fac.primary = [];
  fac.secondary = [];
  fac.password = null;
  fac.id = global_id;
  console.log("Adding a facility to mongodb... " + global_id);
  let insert = await database.insertOne(fac);
  if (insert.acknowledged) {
    console.log("Successfully added");
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


const letter_map = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
]
const number_map = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
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

module.exports = {
  add: add,
  toEmbed: toEmbed,
  getTooltip: getTooltip,
  hexes1: hexes1,
  hexes1only: hexes1only,
  hexes2: hexes2,
  number_map: number_map,
  letter_map: letter_map,
  keypad_map: keypad_map,
  artilleryItems: artilleryItems,
  directions: directions,
}

