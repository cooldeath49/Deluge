// console.log(asd);
// console.log(data);
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

function toPixelDistance(pos) {
  if (pos.isApi) {
    return {
      top: parseInt(pos.y * 1776),
      left: parseInt(pos.x * 2048)
    }
  } else if (pos.isGrid) { //x is normal, y is inverted
    return {
      top: parseInt(pos.y * 125 * 1776/1875),
      left: parseInt(pos.x * 125 * 2048/2125)
    }
  }
}

let position = {
  x: 10,
  y: 5,
  isGrid: true
}

let dist = toPixelDistance(position);
console.log(dist);
let {makeImage} = require("./storage.js");

// console.log(toPixelDistance(position));

// Combine the base image and the text image

// Define the base image path
const marker = sharp(path.resolve('marker1.png'));
const hexPath = path.resolve("HexImages", "Acrithia.png")

// Create the text image

// async function makeImage() {
//   let data = await (await fetch("https://war-service-live.foxholeservices.com/api/worldconquest/maps/DeadLandsHex/dynamic/public")).json();

//   // console.log(data.mapItems)

//   for (let item in data.mapItems) {
//     // console.log(data.mapItems[item].iconType)
//   }

//   // console.log(meta);
//   const digit = sharp({
//     text: {
//       text: "0",
//       align: 'center',
//       rgba: true,
//       font: '50px',
//       // fontfile: ITALIC_FONT
//     },
//   }).png();
//   // console.log(digit)
//   // const marker_template = sharp(markerPath);

//   marker
//   .composite([{ 
//     input: await digit.toBuffer(), top: 25, 
//     left: parseInt((await marker.metadata()).width/2 - (await digit.metadata()).width/2) 
//   }])
//   .png();
    

//   sharp(hexPath)
//   .composite([{
//     input: await marker.toBuffer(),
//     left: dist.left,
//     top: dist.top
//   }]).toFile("sus.png");

//   // console.log(meta2);
 
// }
// makeImage();

// console.log(hexes1only);

let arr = [
  {
    pos: {
      x: 10,
      y: 7,
      type: "Grid"
    },
    id: 4
  },


]
makeImage(arr, "The Drowned Vale")