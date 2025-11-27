export const careData = {
  careTemp: {
    intermediate: {
      label: 'Intermediate',
      description: 'Plants grow well at a wide range of temperatures and do not require a significant temp drop at night.',
      tempRange: '58-70F at night, 70-85F during the day',
    },
    highland: {
      label: 'Highland',
      description: 'Plants require a significant temp drop at night and will need active cooling to thrive.',
      tempRange: '50F-62F lows at night, 70-78F during the day.',
    },
    lowland: {
      label: 'Lowland',
      description: 'Plants need warm conditions to thrive, may require heating.',
      tempRange: '70F-80F lows at night, 80-90F highs during the day.',
    },
    roomTemp: {
      label: 'Room temp',
      description: 'Plants do well at typical room temperatures.',
      tempRange: '67-80F day or night.',
    },
  },
}
export const guideData = {
  general: {
    fertilizer:
      'You can feed live, dead, or even dried insects to your plants as food.  If you would rather not, or to supplement these feedings, here are a few options for fertilizers.  I generally rotate between these three for variety, and apply every 2-4 weeks: Maxsea - kelp based fertilizer that is mixed with water and                sprayed on leaves and in pitchers. I use 1/8tsp per gallon. Osmocote - pellets that can be placed in pitchers and will release slowly when temperatures rise &#62; 75&deg;F. Nutricote - pellets that can be placed in pitchers and will release slowly with exposure to water/pitcher fluid.',
    light:
      'I grow all my plants under LED grow lights, specifically HLG 65 V2 4000K and Florawave P80. You can also grow them in a windowsill or greenhouse.',
    water: 'Carnivorous plants need water with low Total Dissolved Solids (TDS), such as distilled, reverse osmosis, or rain water.',
  },
  genus: {
    heliamphora: {
      label: 'Heliamphora',
      locale:
        'Heliamphora are native to highland plateaus called Tepuis in South America. Tepuis receive a ridiculous amount of rainfall which washes away most nutrients in the soil, thus Heliamphora have adapted to get their nutrition from... other sources 😉.',
      humidity: 'Heliamphora need supplemental humidity to thrive. I keep mine between 75-90% RH.',
      water:
        'Heliamphora like a lot of water. We prefer to top water daily, filling pitchers with each watering and letting the excess drain. Heliamphora can also be grown in trays but will require potting media that wicks water. We have also had success growing in a flood and drain hydroponic system.',
      temperature:
        'Heliamphora do not need a nigh-time temperature drop but are very sensitive to warm temperatures. If regularly kept above 82°F, a fungus can develop which causes plant death. The exception is with H. ciliata which is known as a "true lowland" species and can be grown in warmer conditions.',
      media:
        "In general, heliamphora are not picky about their potting media. They will do well in most mixes with a combination of coco (chips or coir), peat, pumice, peat, long-fiber sphagnum, Fluval Stratum We use a mixture of roughly equal parts coco chips and pumice plus a small percentage of biochar and organic fertilizer. This is an extremely high draining mix which works well for daily top watering. If you choose to top-water, you will need to amend the mix with something to wick water, such as 20-30% long-fibered sphagnum moss.",
      light:
        'Heliamphora will take as much light as you can give them. When given enough light, most species will have beautiful red coloration.',
      fertilization:
        'If grown indoors, fertilizer is a must for healthy plants. Heliamphora do well with a variety of fertilizers including fish hydrolysate, MSU orchid fertilizer, Superthrive, and Maxsea. Miracle Grow Azalea, Camellia, Rhododendron. We typically use a mix of these to avoid nutrient deficiency from any single brand. Aim for a NPK ratio with more nitrogen than phosphorus or potassium. The Miracle Gro mix (30-10-10) and most fish fertilizers are perfect for this. Maxsea (16-16-16) is very unbalanced and should be mixed with something to bring the nitrogen up.',
      referencePhotoFilename: 'Heliamphora.jpg',
      referencePhotoPath: 'referencePhotos/IMG_20240403_071908 (1).jpg',
    },
    nepenthes: {
      label: 'Nepenthes',
      locale:
        'Nepenthes are native to Southeast Asia and parts of Africa and Australia. The pitchers are modified leaves that trap insects and digest them for nutrition.',
      humidity:
        'Some nepenthes can adapt to normal room level humidity, however in my experience, all nepenthes do better with supplemental humidity. I keep mine between 75-90% RH',
      light:
        "Light requirements vary by species and as such, you should research the natural conditions of yours species. Generally, most nepenthes grow in a forest and are shaded for much of the day, thus they don't need particularly high light levels. If grown in a greenhouse, shade cloth is required.",
      water: 'I never let my nepenthes sit in water.  I keep them moist and let the water drain off.',
      temperature:
        'Nepenthes generally fall into three categories: Highland: these plants live at high elevations and require temperature drops of 10-20°F at night. Intermediate: plants that live between the highland and lowland areas and can adapt to a wide range of conditions. Lowland: these plants live at low elevations in hot, humid conditions and may require heating above normal room temps.',
      media:
        "Most nepenthes do well in a loose draining mix of long-fibered sphagnum moss and perlite. I also use coco husk chips, although it's important to find a brand that has low salt content.",
      fertilization:
        "I usually fertilize every 3-6 weeks, alternating between Osmocote (one pellet per pitcher, in about half the open pitchers) and Maxsea (200-300ppm solution, fill most pitchers and spray a bit on the leaves).  I'll also drop random bugs I have found in pitchers.",
      referencePhotoFilename: 'Nepenthes.jpg',
      referencePhotoPath: 'referencePhotos/nep-maxima-stenop-lowii-rokko-veitch-upper-2.jpg',
    },
    cephalotus: {
      label: 'Cephalotus',
      locale: 'Cephalotus are native to the coastal areas of southwest Australia. They live in sandy coastal areas.',
      humidity:
        "I haven't found Cephs to be particularly picky about humidity. I grow mine in my basement freely open to the room air. Too much humidity can cause fungus problems.",
      water:
        'Cephalotus should be kept drier than many other carnivorous plants. I top water the plants and let the trays dry between watering.',
      temperature:
        'Cephalotus grow well at a wide range of temperatures. They can tolerate heat into the 90s and can handle temperatures into the 40s.',
      media: 'I use a mixture of peat, sand and pumice. I like to add a top layer of lava rock or slate to prevent moss and algae.',
      light: 'Cephalotus appreciate high light levels and develop beautiful coloration when given these conditions.',
      fertilization:
        "I usually fertilize every 3-6 weeks, alternating between Osmocote (one pellet per pitcher, in about half the open pitchers) and Maxsea (200-300ppm solution, fill most pitchers and spray a bit on the leaves).  I'll also drop random bugs I have found in pitchers.",
      referencePhotoFilename: 'Cephalotus H. Giant.jpg',
      referencePhotoPath: 'referencePhotos/Cephalotus H. Giant.jpg',
    },
  },
}
