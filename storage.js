const allfacs = [];
const allhexes = ["Basin Sionnach", "Speaking Woods", "Howl County", "Callums Cape", "Reaching Trail", "Clanshead Valley", "Nevish Line", "The Moors", "Viper Pit", "Morgens Crossing", "Oarbreaker Isles", "Stonecradle", "Callahans Passage", "Weathered Expanse", "Godcrofts", "Farranac Coast", "The Linn of Mercy", "Marban Hollow", "Stlican Shelf", "Fishermans Row", "Kings Cage", "Deadlands", "The Clahstra", "Tempest Island", "Westgate", "Loch Mor", "The Drowned Vale", "Endless Shore", "Stema Landing", "Sableport", "Umbral Wildwood", "Allods Bight", "The Fingers", "Origin", "The Heartlands", "Shackled Chasm", "Reavers Pass", "Ash Fields", "Great March", "Terminus", "Red River", "Acrithia", "Kalokai"];

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
  allhexes: allhexes,
  Facility: Facility,
  coord: coord
}
