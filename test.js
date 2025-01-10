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
  const Fuse = require("fuse.js");

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
      "PCMats",
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

  let all_items = [];
  // items.array.map((slice) => all_items.concat(slice));
  for (let slice in items) {
    all_items = all_items.concat(items[slice]);
  }

  const hexes1only = hexes1.map((element) => element[0]);

  const options = {
    shouldSort: true,
    includeScore: true,
  }

  const hex_fuse1 = new Fuse(hexes1only, options) 

  const items_fuse = new Fuse(all_items, {
    shouldSort: true,
    includeScore: true,
    threshold: 0.4
  })


  // let result = hex_fuse1.search("oarbreaker");
  let result = items_fuse.search("rifle");
  console.log(result);