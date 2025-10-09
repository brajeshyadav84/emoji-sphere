# Solar System Planets Explorer

A beautiful, interactive solar system explorer that allows users to learn about all 8 planets in our solar system.

## Features

### 🪐 Interactive Planet Cards
- Beautiful visual representation of each planet with custom colors and sizes
- Hover animations and smooth transitions
- Real-time planet rotation animations
- Special visual effects (Saturn's rings)

### 📊 Detailed Planet Information
- Comprehensive planet statistics (diameter, mass, gravity, etc.)
- Interesting facts about each planet
- Size comparison with Earth
- Temperature ranges and orbital information

### 🎨 Beautiful UI/UX
- Space-themed dark background with animated stars
- Gradient colors and glowing effects
- Responsive design for all screen sizes
- Smooth animations using Framer Motion

### 📱 Mobile Friendly
- Responsive grid layout
- Touch-friendly interactions
- Mobile navigation support

## Components Structure

```
src/
├── components/
│   ├── PlanetCard.tsx      # Individual planet card component
│   ├── PlanetDetail.tsx    # Detailed planet information modal
│   └── SolarSystem.tsx     # Main container component
├── data/
│   └── planets.ts          # Planet data and interface definitions
├── pages/knowledge/
│   └── Planets.tsx         # Main planets page
└── store/
    └── planetStore.ts      # State management for planet selection
```

## Data Structure

Each planet includes:
- Basic information (name, subtitle, description)
- Visual properties (color, size, distance)
- Scientific data (mass, diameter, gravity, etc.)
- Interesting facts
- Orbital characteristics

## Navigation

The planets page is accessible via:
- **Desktop**: Navigation bar → 🪐 Planets
- **Mobile**: Hamburger menu → 🪐 Planets
- **Direct URL**: `/knowledge/planets`

## Technologies Used

- **React 18** with TypeScript
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Context** for state management

## Animation Features

- Planet rotation animations (realistic day lengths for some planets)
- Hover effects and scaling
- Smooth transitions between states
- Staggered loading animations
- Interactive modal animations

## Educational Value

Perfect for:
- Students learning about astronomy
- Kids exploring space
- Anyone interested in our solar system
- Educational institutions

## Future Enhancements

Potential improvements:
- 3D planet models with textures
- Orbital animation visualization
- Moon exploration for each planet
- Solar system scale demonstration
- Interactive quiz features
- Sound effects and music