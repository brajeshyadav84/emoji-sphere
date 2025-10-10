export interface Planet {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  size: number;
  distance: number;
  description: string;
  facts: string[];
  image: string;
  stats: {
    diameter: string;
    mass: string;
    gravity: string;
    dayLength: string;
    yearLength: string;
    moons: number;
    temperature: string;
  };
}

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    subtitle: "The Swift Planet",
    color: "#8C7853",
    size: 38,
    distance: 58,
    description: "Mercury is the smallest planet in our solar system and the one closest to the Sun. It's only slightly larger than Earth's Moon.",
    facts: [
      "Mercury has no atmosphere",
      "A day on Mercury lasts 59 Earth days",
      "It's the fastest planet, completing an orbit in 88 days",
      "Temperatures can reach 427°C during the day"
    ],
    image: "🪐",
    stats: {
      diameter: "4,879 km",
      mass: "3.3 × 10²³ kg",
      gravity: "3.7 m/s²",
      dayLength: "59 Earth days",
      yearLength: "88 Earth days",
      moons: 0,
      temperature: "-173°C to 427°C"
    }
  },
  {
    id: "venus",
    name: "Venus",
    subtitle: "The Morning Star",
    color: "#FFC649",
    size: 95,
    distance: 108,
    description: "Venus is the second planet from the Sun and is often called Earth's twin because of their similar size and mass.",
    facts: [
      "Venus rotates backwards compared to most planets",
      "It's the hottest planet in our solar system",
      "A day on Venus is longer than its year",
      "Venus has thick clouds of sulfuric acid"
    ],
    image: "🌕",
    stats: {
      diameter: "12,104 km",
      mass: "4.87 × 10²⁴ kg",
      gravity: "8.87 m/s²",
      dayLength: "243 Earth days",
      yearLength: "225 Earth days",
      moons: 0,
      temperature: "462°C"
    }
  },
  {
    id: "earth",
    name: "Earth",
    subtitle: "The Blue Planet",
    color: "#6B93D6",
    size: 100,
    distance: 150,
    description: "Earth is the third planet from the Sun and the only known planet to harbor life. It's our home in the universe.",
    facts: [
      "71% of Earth's surface is covered by water",
      "Earth has one natural satellite - the Moon",
      "It takes 24 hours for Earth to rotate once",
      "Earth's atmosphere is 78% nitrogen and 21% oxygen"
    ],
    image: "🌍",
    stats: {
      diameter: "12,756 km",
      mass: "5.97 × 10²⁴ kg",
      gravity: "9.8 m/s²",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      moons: 1,
      temperature: "-89°C to 58°C"
    }
  },
  {
    id: "mars",
    name: "Mars",
    subtitle: "The Red Planet",
    color: "#CD5C5C",
    size: 53,
    distance: 228,
    description: "Mars is the fourth planet from the Sun and is often called the Red Planet due to the iron oxide on its surface.",
    facts: [
      "Mars has the largest volcano in the solar system",
      "A day on Mars is about 24 hours and 37 minutes",
      "Mars has two small moons: Phobos and Deimos",
      "Evidence suggests Mars once had liquid water"
    ],
    image: "🔴",
    stats: {
      diameter: "6,792 km",
      mass: "6.39 × 10²³ kg",
      gravity: "3.71 m/s²",
      dayLength: "24h 37m",
      yearLength: "687 Earth days",
      moons: 2,
      temperature: "-87°C to -5°C"
    }
  },
  {
    id: "jupiter",
    name: "Jupiter",
    subtitle: "The Gas Giant",
    color: "#D8CA9D",
    size: 1120,
    distance: 778,
    description: "Jupiter is the largest planet in our solar system and is known for its Great Red Spot, a giant storm.",
    facts: [
      "Jupiter is more than twice as massive as all other planets combined",
      "It has the shortest day of all planets - just 10 hours",
      "Jupiter has at least 79 known moons",
      "The Great Red Spot is a storm larger than Earth"
    ],
    image: "🪐",
    stats: {
      diameter: "142,984 km",
      mass: "1.898 × 10²⁷ kg",
      gravity: "24.79 m/s²",
      dayLength: "10 hours",
      yearLength: "12 Earth years",
      moons: 79,
      temperature: "-108°C"
    }
  },
  {
    id: "saturn",
    name: "Saturn",
    subtitle: "The Ringed Planet",
    color: "#FAD5A5",
    size: 945,
    distance: 1434,
    description: "Saturn is the sixth planet from the Sun and is famous for its spectacular ring system.",
    facts: [
      "Saturn's rings are made of ice and rock particles",
      "Saturn is less dense than water",
      "It has at least 82 known moons",
      "Saturn's largest moon, Titan, has a thick atmosphere"
    ],
    image: "🪐",
    stats: {
      diameter: "120,536 km",
      mass: "5.683 × 10²⁶ kg",
      gravity: "10.44 m/s²",
      dayLength: "10h 33m",
      yearLength: "29 Earth years",
      moons: 82,
      temperature: "-139°C"
    }
  },
  {
    id: "uranus",
    name: "Uranus",
    subtitle: "The Ice Giant",
    color: "#4FD0E7",
    size: 400,
    distance: 2867,
    description: "Uranus is the seventh planet from the Sun and rotates on its side, making it unique among planets.",
    facts: [
      "Uranus rotates on its side at a 98-degree angle",
      "It has a faint ring system",
      "Uranus is the coldest planet in our solar system",
      "It has 27 known moons"
    ],
    image: "🔵",
    stats: {
      diameter: "51,118 km",
      mass: "8.681 × 10²⁵ kg",
      gravity: "8.69 m/s²",
      dayLength: "17h 14m",
      yearLength: "84 Earth years",
      moons: 27,
      temperature: "-197°C"
    }
  },
  {
    id: "neptune",
    name: "Neptune",
    subtitle: "The Windy Planet",
    color: "#4B70DD",
    size: 388,
    distance: 4515,
    description: "Neptune is the eighth and outermost planet in our solar system, known for its supersonic winds.",
    facts: [
      "Neptune has the fastest winds in the solar system",
      "It takes 165 Earth years to orbit the Sun",
      "Neptune has 14 known moons",
      "It was the first planet discovered through mathematical prediction"
    ],
    image: "🔵",
    stats: {
      diameter: "49,528 km",
      mass: "1.024 × 10²⁶ kg",
      gravity: "11.15 m/s²",
      dayLength: "16h 6m",
      yearLength: "165 Earth years",
      moons: 14,
      temperature: "-201°C"
    }
  }
];