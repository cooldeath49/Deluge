const allfacs = [];
const testhex = [
  {
    details: {
      label: "The Linn of Mercy",
      description: "The Linn of Mercy",
      value: "The Linn of Mercy",
    },
    towns: [
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
    ],
  }
]
const hexes1 = [
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
    label: "Farranac Coast",
    description: "Farranac Coast",
    value: "Farranac Coast",
  },
  {
    label: "The Linn of Mercy",
    description: "The Linn of Mercy",
    value: "The Linn of Mercy",
  },
  {
    label: "Marban Hollow",
    description: "Marban Hollow",
    value: "Marban Hollow",
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
    label: "Deadlands",
    description: "Deadlands",
    value: "Deadlands",
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
const hexes2 = [ {
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
    


class Facility {
  hex;
  letter;
  letternumber;
  grid;
  id;
  lastupdated; 

  regiment;
  contact;
  constructor(hex, letter, letternumber, grid, id, reg) {
    this.hex = hex;
    this.letter = letter;
    this.letternumber = letternumber;
    this.grid = grid;
    this.id = id;
    this.regiment = reg;
    this.lastupdated = Date.now();
  }

  update() {
    lastupdated = Date.now();
  }
}
function coord(fac) {
  return fac.hex + "-" + fac.letter + fac.letternumber + "k" + fac.grid;
}

module.exports = {
  allfacs: allfacs,
  hexes1: hexes1,
  hexes2: hexes2,
  testhex: testhex,
  Facility: Facility,
  coord: coord
}
