import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { planets } from '@/data/planets';
import { PlanetCard } from './PlanetCard';
import { PlanetDetail } from './PlanetDetail';
import { SolarSystem3D } from './SolarSystem3D';
import { usePlanetStore } from '@/store/planetStore';
import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
};

export const SolarSystem: React.FC = () => {
  const { selectedPlanet } = usePlanetStore();
  const selectedPlanetData = planets.find(p => p.id === selectedPlanet);
  const [view3D, setView3D] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 2 + 2 + 's',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            SOLAR SYSTEM
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-2">
            Explore the Planets of Our Solar System
          </p>
          <p className="text-lg text-purple-300 mb-6">
            Click on any planet to learn fascinating facts and details
          </p>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={!view3D ? "default" : "outline"}
              onClick={() => setView3D(false)}
              className={`${!view3D ? 
                "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 hover:from-purple-500 hover:to-pink-600" : 
                "border-purple-400 text-purple-300 hover:bg-purple-400/10"
              }`}
            >
              🃏 Card View
            </Button>
            <Button
              variant={view3D ? "default" : "outline"}
              onClick={() => setView3D(true)}
              className={`${view3D ? 
                "bg-gradient-to-r from-indigo-400 to-purple-500 text-white border-0 hover:from-indigo-500 hover:to-purple-600" : 
                "border-indigo-400 text-indigo-300 hover:bg-indigo-400/10"
              }`}
            >
              🌌 3D Solar System
            </Button>
          </div>
        </motion.div>

        {/* Conditional Rendering based on view */}
        {view3D ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <SolarSystem3D />
          </motion.div>
        ) : (
          /* Planets Grid */
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {planets.map((planet) => (
              <motion.div key={planet.id} variants={item}>
                <PlanetCard 
                  planet={planet} 
                  isSelected={selectedPlanet === planet.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Solar System Overview */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">About Our Solar System</h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Our solar system consists of the Sun and everything that orbits around it, including 
              eight planets, their moons, asteroids, comets, and other celestial objects. 
              Formed about 4.6 billion years ago, it's located in the Milky Way galaxy and 
              continues to fascinate us with its incredible diversity and beauty.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">8</div>
                <div className="text-sm text-gray-300">Planets</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">1</div>
                <div className="text-sm text-gray-300">Star (Sun)</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">200+</div>
                <div className="text-sm text-gray-300">Known Moons</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">4.6B</div>
                <div className="text-sm text-gray-300">Years Old</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Planet Detail Modal */}
      <PlanetDetail planet={selectedPlanetData || null} />
    </div>
  );
};