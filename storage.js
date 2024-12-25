const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
  ActionRow

} = require('discord.js');

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


  productionIterator = class { //anonymous class containing methods to parse and iterate
    //overkill...? probably, lol
    table;
    quantity_table;
    constructor(table, quantity) {
      this.table = table;
      if (quantity) {
        this.quantity_table = quantity;
      } else {
        this.quantity_table = {};
        for (let ele in table) {
          quantity[ele] = [0, Date.now()];
        }
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
    embed.addFields(
      { name: '\u200B', value: '\u200B' },
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
      {name: '\u200B', value: '\u200B' },
      {name: "Primary Production", value: this.primary.getString(), inline: true},
      {name: "Secondary Production", value: this.secondary.getString(), inline: true}
    );

    if (this.primary.table.length > 0) {
      let primary_quantity = this.primary.quantity_table;
      let primaryEmbed = new EmbedBuilder()
      .setTitle("Primary Production Quantities")
      for (let item in primary_quantity) {
        primaryEmbed.addFields({name: item, value: primary_quantity[0] + " - *last updated <t:" + primary_quantity[1] + ":R>*"});
      }

      embeds.push(primaryEmbed);
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

class AllContainer {
  global_count;
  global_id;
  hexes;
  facility_id_tracker;
  hexes_str_array;

  constructor() {
    this.hexes = [];
    this.facility_id_tracker = [];
    this.global_count = 0;
    this.global_id = 0;
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

  add(args) {
    this.global_id++;
    let facility = new Facility(args, this.global_id);
    let hex = this.get_hex(args[0]);
    hex.add(facility);
    this.facility_id_tracker[this.global_id] = facility;
    this.global_count++;

    console.log("Added facility, id " + this.global_id + " with the following data: " + args);
    return facility;
  }

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
  hexes1: hexes1,
  hexes1array: hexes1array,
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
