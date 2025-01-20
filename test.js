fetch("https://war-service-live.foxholeservices.com/api/worldconquest/maps/DeadLandsHex/dynamic/public")
    .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Assuming the response is JSON
  })
  .then(data => {
    console.log(data); // Process the retrieved data
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });


  const path = require("path");
const sharp = require("sharp");


// Combine the base image and the text image

// Define the base image path
const baseImagePath = path.resolve('marker1.png');

// Create the text image

async function ah() {
  const meta = await sharp("marker1.png").metadata();
  console.log(meta);
  const mapText = await sharp({
    text: {
      text: "12",
      align: 'center',
      rgba: true,
      font: '50px',
      // fontfile: ITALIC_FONT
    },
  }).png();
  const meta2 = await mapText.metadata();
  const buffer = await mapText.toBuffer();
  console.log(meta2);
  try {
    await sharp(baseImagePath)
    .composite([{ input: buffer, top: 25, left: parseInt(meta.width/2 - meta2.width/2) }])
    .toFile('output-image.png');
    console.log("we did it")
  } catch (er) {
    console.log(er)
  }
    
}
ah();

