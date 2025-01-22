let data;

async function a() {
  data = await (await fetch("https://war-service-live.foxholeservices.com/api/worldconquest/maps/DeadLandsHex/dynamic/public")).json();
  // asd = data.mapItems;
}

a();

// console.log(asd);
// console.log(data);

  const path = require("path");
const sharp = require("sharp");

function toPixelDistance(pos) {
  if (pos.isApi) {
    return {
      top: pos.y * 1776,
      left: pos.x * 2048
    }
  } else if (pos.isGrid) { //x is normal, y is inverted
    return {
      top: pos.y * 125 * 1776/1875,
      left: pos.x * 125 * 2048/2125
    }
  }
}

let position = {
  x: 5,
  y: 5,
  isGrid: true
}

console.log(toPixelDistance(position));

// Combine the base image and the text image

// Define the base image path
const markerPath = path.resolve('marker1.png');
const hexPath = path.resolve("HexImages", "MapAcrithiaHex.png")

// Create the text image

async function makeImage() {
  const meta = await sharp("marker1.png").metadata();
  // console.log(meta);
  const digit = await sharp({
    text: {
      text: "12",
      align: 'center',
      rgba: true,
      font: '50px',
      // fontfile: ITALIC_FONT
    },
  });
  console.log(digit)
  const marker = await sharp(markerPath);
  
  const digit_meta = await sharp(digit).metadata();
  const marker_meta = await marker.metadata();
  // const meta2 = await mapText.metadata();

  const markersharp = marker
  .composite([{ 
    input: await digit.toBuffer(), top: 25, 
    left: parseInt(marker_meta.width/2 - digit_meta.width/2) 
  }])
  .toFile("test.png");
    
/*
  const png2 = await sharp(hexPath)
  .composite([{
    input: await markersharp.toBuffer()
  }]).toFile("sus.png");*/

  // console.log(meta2);
 
}
makeImage();

