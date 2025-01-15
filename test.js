/*fetch("https://war-service-live.foxholeservices.com/api/worldconquest/maps/DeadLandsHex/dynamic/public")
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
  });*/

  const sharp = require("sharp");


  async function ah() {
    await sharp("./HexImages/MapAcrithiaHex.png")
    .rotate(45)
    .grayscale()
    .toFormat("jpeg", {mozjpeg: true})
    .toFile("acrithia.jpeg");
  }
ah();

let a = "hi";
let c;
switch (a) {

  case "ha": {
    let b = 4;
    console.log(b);
    break;
  }
  case "hi": {
    let b = 5;
    c = b;
    console.log(c);
    break;
  }
  case "no": {
    let b = 6;
    console.log(b);
    break;
  }
}
console.log(c);