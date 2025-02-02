const { Client, GatewayIntentBits, EmbedBuilder
} = require('discord.js');
const { MongoClient } = require("mongodb");
const {uri} = require("./sensitive.js");
const Fuse = require("fuse.js");

const mongo_client = new MongoClient(uri);
const database = mongo_client.db("facilities").collection("facilities");
let global_id = 0;
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const letter_map = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
]
const number_map = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
]
const keypad_map = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
]

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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

function gridToCoordinates(letter, number) {
  return {
    x: letter_map.indexOf(letter), 
    y: number_map.indexOf(parseInt(number)),
    type: "Grid"
  }
}

function toPixelDistance(pos) {
  if (pos.type == "API") {
    return {
      top: parseInt(pos.y * 1776),
      left: parseInt(pos.x * 2048)
    }
  } else if (pos.type == "Grid") { //x is normal, y is inverted
    return {
      top: parseInt(pos.y * 125 * 1776/1875),
      left: parseInt(pos.x * 125 * 2048/2125)
    }
  }
}

//arr is an array of objects containing id and pos
//pos is an object with x, y and type
async function makeImage(arr, hex) {
  let hexPath = path.resolve("HexImages", hex + ".png");
  let sharp_hex = sharp(hexPath);
  let comp_arr = [];
  

  for (let obj in arr) {
    let marker = sharp(path.resolve('marker1.png'));
    let pos = toPixelDistance(arr[obj].pos);
    console.log(pos);
    let digit = sharp({ //instantiate sharp digit
      text: {
        text: arr[obj].id.toString(),
        align: 'center',
        rgba: true,
        font: '50px',
      },
    }).png();

    marker.composite([{ 
      input: await digit.toBuffer(), 
      left: parseInt((await marker.metadata()).width/2 - (await digit.metadata()).width/2),
      top: 25, 
    }]).png();

    
    comp_arr.push(
      {
        input: await marker.toBuffer(),
        left: pos.left,
        top: pos.top,
        premultiplied: true
      }
    )
  }
  
  return sharp_hex.composite(comp_arr).toBuffer();
}
// returns filename to image
async function createHexImage(facs, hex) {
  return await makeImage(facs.map((fac) => {return {
    pos: gridToCoordinates(fac.letter, fac.number),
    id: fac.id
  }}), hex);
}

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
    ],
    ["The Oarbreaker Isles",
      "The Conclave",
      "Silver",
      "Fort Fogwood",
      "Partisan Island",
      "Posterus",
      "Integrum",
      "The Dirk",
      "Gold",
      "Grisly Refuge"
    ],
    ["King's Cage",
      "The Manacle",
      "Den of Knaves",
      "Eastknife",
      "The Bailie",
      "Slipchain",
      "Gibbet Fields",
      "Southblade",
      "Scarlethold",
    ],
    ["The Clahstra",
      "The Treasury",
      "Third Chapter",
      "The Vault",
      "Weephome",
      "East Narthex",
      "Watchful Nave",
      "Transept",
      "Bewailing Fort",
    ], 
    ["Stlican Shelf",
      "Port of Rime",
      "Briar",
      "Cavilltown",
      "Thornhold",
      "Fort Hoarfrost",
      "The South Wind",
      "Vulpine Watch",
      "The Old Mourn", 
    ],
    ["Godcrofts",
      "Isawa",
      "Ursa Base",
      "Fleecewatch",
      "Protos",
      "The Axehead",
      "Saegio",
      "Argosa",
      "Lipsia",
      "Exile"
    ]
];


const hexes2 = [
  ["Loch Mor",
    "Westmarch",
    "Mercy's Wish",
    "Moon's Copse",
    "The Roilfort",
    "Feirmor",
    "Market Road",
    "Tomb of the First",
  ],
  ["The Drowned Vale",
  "The Baths",
  "Bootnap",
  "Singing Serpents",
  "The Saltcaps",
  "Loggerhead",
  "Wisp's Warning",
  "Eastmarch",
  "The Wash",
  "Vessel",
  "Splinter Pens",
  "Coaldrifter Stead"
  ],
  ["Endless Shore",
    "Saltbrook Channel",
    "Wellchurch",
    "Sidhe Fall",
    "Tuatha Watchpost",
    "Woodbind",
    "The Overland",
    "Iron Junction",
    "Enduring Wake",
    "Brackish Point",
    "The Old Jack Tar"
  ], 
  [
    "Stema Landing",
    "Acies Overlook",
    "The Spearhead",
    "Base Sagitta",
    "Base Ferveret",
    "The Wane",
    "Alchimio Estate",
    "Verge Wing",
    "Ustio",
    "The Flair"
  ],
  ["Sableport",
    "Barronhome",
    "The Robin's Nest",
    "The Pendant",
    "Cinderwick",
    "The Whetstone",
    "Light's End",
    "Talonsfort"
  ],
  ["Umbral Wildwood",
    "Thunderfoot",
    "Clotho's Refuge",
    "Stray",
    "Vagrant Bastion",
    "The Foundry",
    "Goldenroot Ranch",
    "Sentry",
    "Atropos' Fate",
    "Hermit's Rest",
    "Lachesis' Tally",
    "Amethyst",
  ],
  ["Allod's Bight",
    "Mercy's Wail",
    "The Stone Plank",
    "Homesick",
    "Scurvyshire",
    "Rumhold",
    "Belaying Trace",
    "The Turncoat"
  ],
  ["The Fingers",
    "The Old Captain",
    "Titancall",
    "Tethys Base",
    "Fort Barley",
    "Plankhouse",
    "Second Man",
    "Headsman's Villa",
    "The Tusk",
    "Captain's Dread"  
  ],
  ["Origin",
    "The Steel Road",
    "Arise",
    "Initium",
    "Dormio",
    "World Star",
    "Teichotima",
    "Finis"
  ],
  ["The Heartlands",
    "The Blemish",
    "Oleander Homestead",
    "Fort Providence",
    "Greenfield Orchard",
    "Proexi",
    "Deeplaw Post",
    "The Breach",
    "Barronswall",
    "Barrony Ranch",
    "The Plough"
  ],
  ["Shackled Chasm",
    "Silk Farms",
    "The Vanguard",
    "Simo's Run",
    "The Bell Toll",
    "Firstmarch",
    "Limewood Holdfast",
    "Savages",
    "Gorgon Grove",
    "Reflection",
    "The Grave of Erastos"
  ],
  ["Reaver's Pass",
    "Keelhaul",
    "Clay Coffer",
    "Thimbre Base",
    "Scuttletown",
    "Fort Rictus",
    "The Bilge",
    "Breakwater"
  ],
  ["Ash Fields",
    "Ashtown",
    "The Ashfort",
    "Sootflow",
    "Electi",
    "Camp Omega",
    "Cometa",
    "The Calamity"  
  ],
  ["Great March",
    "Sitaria",
    "Myrmidon's Stay",
    "Dendro Field",
    "Remnant Villa",
    "The Swan",
    "Leto",
    "Camp Senti",
    "Violethome",
    "Lionsfort"
  ],
  ["Terminus",
    "Therizo",
    "Bloody Palm Fort",
    "Winding Bolas",
    "Warlord's Stead",
    "Cerberus Wake",
    "Thunderbolt",
  ],
  ["Red River",
    "Cannonsmoke",
    "Victoria Hill",
    "Judicium",
    "Fort Matchwood",
    "Minos",
    "Climb",
    "Penance",
    "Camp Upsilon",
  ],
  ["Acrithia",
    "Patridia",
    "The Brinehold",
    "Legion Ranch",
    "Nereid Keep",
    "Camp Omicron",
    "Heir Apparent",
    "Swordfort",
    "Thetus Ring",
  ],
  ["Kalokai",
    "Baccae Ridge",
    "Camp Tau",
    "Lost Greensward",
    "Night's Regret",
    "Hallow",
    "Sourtooth",
    "Sweethearth"
  ]
]

const items = {
  "Primitive Resources": 
  ["Scrap", 
    "Components", 
    "Sulfur",
    "Damaged Components",
    "Crude Oil",
    "Diesel",
    "Water",
    "Coal", 
    "Rare Metals"],

  "Small-Arms Weaponry":
    ["Falias Raiding Club",
      "Booker Greyhound Model 910",
      "20mm",
      "White Ash Flask",
      "Shrapnel Mortar Shell",
      "Flare Mortar Shell",
      "Mortar Shell",
      "Incendiary Mortar Shell",
      "Anti-Tank Sticky Bomb",
      "PT-815 Smoke Grenade",
      "228 Satterley Heavy Storm Rifle",
  ],

  "Infantry Deployables": [
    "Crow's Foot Mine",
    "Sandbags",
    "Abisme AT-99 Mine",
    "Barbed Wire",
    "Metal Beam",
  ],

  "Large-Caliber Weaponry": [
    "250mm",
    "120mm",
    "Flame Ammo",
    "E680-S Rudder Lock",
    "3C-High Explosive Rocket",
    "4C-Fire Rocket",
    "150mm",
    "75mm",
    "94.5mm",
    "Model-7 \'Evie\'",
    "Moray Torpedo",
  ],
  "Facility Materials": [
    "Petrol",
    "PCmats",
    "Assmat II",
    "Heavy Oil",
    "Enriched Oil",
    "Coke",
    "Explosive Powder",
    "High Explosive Powder",
    "Concrete",

    "CMats",
    "Steel",
    "Rare Alloys",

    "Pipes",

    
    "Assmat I",
    "Assmat III",
    "Assmat IV",
    "Assmat V",

    "MSups",


  ]
}

const services = {
  "Motor Pool": [
    "Bonewagon",
    "TAC",
    "HAC",
    "Flame AC",
    "20mm FAT",
    "Amphibious LUV",
    "Spitfire",
  ],
  "Battery Line": [
    "Rocket HT",
    "Wasp Nest",
    "ATHT",
    "Scar Twin",
    "Rocket ST",
  ],
  "Field Station": [
    "30mm ST",
    "ACV",
    "Harvester",
    "HVFAT",
    "Heavy Truck",
    "Fuel Trailer",
    "Large-Item Trailer",
    
  ],
  "Tank Factory": [
    "Highwayman",
    "Ironhide",
    "Outlaw",
    "Chieftain",
    "Mortar LT",
    "Flame HTD",
    "Starbreaker"
  ],

  "Weapons Platform": [
    "Thornfall",
    "Stockade",
    "STD"
  ],

  "Naval Works": [
    "Hull Segments",
    "Shell Plating",
    "Turbine Components"
  ],

  "Train Assembly": [
    "RSC",
    "Warsmith",
    "Bloodtender"
  ],

  "Heavy Tank Assembly": [
    "BT",
    "Flame BT",
    "SHT",
    "SPG"
  ],

  // "Vehicle Vetting": [
  // ],
  "Drydock": [
    "Battleship",
    "Frigate",
    "Submarine"
  ],
}

let all_items = [];
  // items.array.map((slice) => all_items.concat(slice));
for (let slice in items) {
  all_items = all_items.concat(items[slice]);
}

let all_services = [];
for (let slice in services) {
  all_services = all_services.concat(services[slice]);
}

const services_fuse = new Fuse(all_services, {
  shouldSort: true,
    includeScore: true,
})

const items_fuse = new Fuse(all_items, {
    shouldSort: true,
    includeScore: true,
})

const items_cate_fuse = new Fuse(Object.keys(items), {
  shouldSort: true,
  includeScore: true
})

const services_cate_fuse = new Fuse(Object.keys(services), {
  shouldSort: true,
    includeScore: true,
})

const hexes1only = hexes1.map((element) => element[0]);
const hexes2only = hexes2.map((element) => element[0]);

const allhexesonly = hexes1only.concat(hexes2only)

const hexes1_fuse = new Fuse(hexes1only, {
  shouldSort: true,
  includeScore: true
})

const allhexes_fuse = new Fuse(allhexesonly, {
  shouldSort: true,
  includeScore: true
})

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

function getTooltip(fac, state, arr_items) {
  if (state == "imports" || state == "exports" || state == "services") {
    if (fac[state] && fac[state].length > 0) {
      let str1 = "";
      let str2 = "";
      //item string
      for (let ind in fac[state]) {
        let details = getTooltip(fac, "details", fac[state][ind].arr);
        if (ind == fac[state].length - 1) {
          str1 = str1 + (details == "None listed" ? "" : details);
        } else {
          str1 = str1 + (details == "None listed" ? "" : details + ", ");
        }
      }

      if (str1 == "") {
        str1 = "None listed";
      }
      
      //Category string
      for (let ind in fac[state]) {
        if (ind == fac[state].length - 1) {
          str2 = str2 + fac[state][ind].category;
        } else {
          str2 = str2 + fac[state][ind].category + ", ";
        }
      }
      return (str1.length < 100 && str1 != "None listed") ? str1 : str2;
    } else {
      return "None listed"
    }
  } else if (state == "details" && arr_items) {
    let str = "";
    if (arr_items.length > 0) {
      for (let ind in arr_items) {
        if (ind == arr_items.length - 1) {
          str = str + arr_items[ind].name;
        } else {
          str = str + arr_items[ind].name + ", ";
        }
      }
    } else {
      str = "None listed";
    }
    
    return str;
  } else if (state == "time details" && arr_items) {
    let str = "";
    if (arr_items.length > 0) { 
      for (let ind in arr_items) {
        let count = arr_items[ind].stock;
        str = str + "- " + (count >= 1000 ? (Math.floor(count/100)/10).toString() + "k" : count) + " " + arr_items[ind].name + ", *last updated <t:" + arr_items[ind].date + ":R>*\n"
      }
    } else {
      str = "None listed";
    }
    
    return str;
  }
  
  
}

async function add(fac) {
  global_id++;

  await database.updateOne({counter: "counter"}, {$set: {
    global_id: global_id,
  }});
  
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
  let update_str;
  let calc = Math.floor(Date.now()/60000) - fac.last/60 //time in minutes
  if (calc >= 5760) {
    update_str = "Last Updated: <t:" + fac.last + ":R> :red_circle:"
  } else if (calc >= 2880) {
    update_str = "Last Updated: <t:" + fac.last + ":R> :orange_circle:"
  } else {
    update_str = "Last Updated: <t:" + fac.last + ":R> :green_circle:"
  }
  if (fac.password) {
    embed.setDescription("This registration is password protected :lock:\n" + update_str)
  } else {
    embed.setDescription(update_str)
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
 

  embed.addFields({
    name: "Imports", value: getTooltip(fac, "imports"), inline: true
  },
  {
    name: "Exports", value: getTooltip(fac, "exports"), inline: true
  },
  {
    name: "Vehicle Services", value: getTooltip(fac, "services"), inline: true
  }
  )

  if (fac.notes) {
    embed.addFields({
      name: "Owner's Notes", value: fac.notes
    });
  } else {
    embed.addFields({
      name: "Owner's Notes", value: "None written"
    });
  }

  if (fac.imports.length > 0) {
    let imports_embed = new EmbedBuilder()
    .setTitle("Imports")

    for (let slice in fac.imports) {
      let cate = fac.imports[slice].category;
      let cate_items = fac.imports[slice].arr;
      let value_str = getTooltip(fac, "time details", cate_items);

      imports_embed.addFields({
        name: cate, value: value_str, inline: true
      });
    }
    embeds.push(imports_embed);
  }

  if (fac.exports.length > 0) {
    let exports_embed = new EmbedBuilder()
    .setTitle("Exports")

    for (let slice in fac.exports) {
      let cate = fac.exports[slice].category;
      let cate_items = fac.exports[slice].arr;
      let value_str = getTooltip(fac, "time details", cate_items);

      exports_embed.addFields({
        name: cate, value: value_str, inline: true
      });
    }
    embeds.push(exports_embed);
  }

  if (fac.services.length > 0) {
    let services_embed = new EmbedBuilder()
    .setTitle("Services")

    for (let slice in fac.services) {
      let cate = fac.services[slice].category;
      let cate_items = fac.services[slice].arr;
      let value_str = getTooltip(fac, "details", cate_items);

      services_embed.addFields({
        name: cate, value: value_str, inline: true
      });
    }
    embeds.push(services_embed);
  }
  
  return embeds;
}

module.exports = {
  add: add,
  toEmbed: toEmbed,
  getTooltip: getTooltip,
  hexes1: hexes1,
  hexes1only: hexes1only,
  hexes2: hexes2,
  hexes2only: hexes2only,
  number_map: number_map,
  letter_map: letter_map,
  keypad_map: keypad_map,
  artilleryItems: artilleryItems,
  directions: directions,
  client: client,
  database: database,
  items: items,
  services: services,
  items_fuse: items_fuse,
  services_fuse: services_fuse,
  hexes1_fuse: hexes1_fuse,
  allhexes_fuse: allhexes_fuse,
  items_cate_fuse: items_cate_fuse,
  services_cate_fuse: services_cate_fuse,
  makeImage: makeImage,
  createHexImage: createHexImage
}

