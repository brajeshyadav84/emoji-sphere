import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Environment } from '@react-three/drei';
import { Card } from '@/components/ui/card';

const PlanetShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            3D PLANET SHOWCASE
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Experience the Solar System with Enhanced 3D Graphics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-8">
              <h2 className="text-3xl font-bold mb-6 text-blue-400">✨ Enhanced Features</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Realistic 3D Planets</h3>
                    <p className="text-gray-300">Each planet now features authentic textures, colors, and surface details based on real astronomical data.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🪐</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Interactive Solar System</h3>
                    <p className="text-gray-300">Navigate through a fully interactive 3D solar system with realistic orbital mechanics and scaling.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💫</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Special Effects</h3>
                    <p className="text-gray-300">Atmospheric effects for Earth, Saturn's rings, Jupiter's Great Red Spot, and dynamic lighting.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎮</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Interactive Controls</h3>
                    <p className="text-gray-300">Zoom, rotate, and explore each planet with smooth mouse/touch controls powered by Three.js.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌌</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Immersive Experience</h3>
                    <p className="text-gray-300">Beautiful starfield backgrounds and cosmic lighting create an authentic space exploration experience.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-8">
              <h2 className="text-3xl font-bold mb-6 text-purple-400">🛠️ Technical Implementation</h2>
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">@react-three/fiber</h3>
                  <p className="text-gray-300 text-sm">React renderer for Three.js, enabling declarative 3D graphics in React applications.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">@react-three/drei</h3>
                  <p className="text-gray-300 text-sm">Helper components for common Three.js use cases like cameras, controls, and geometries.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">Three.js</h3>
                  <p className="text-gray-300 text-sm">WebGL-based 3D graphics library providing the core rendering engine for planetary visualizations.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-pink-400 mb-2">Dynamic Textures</h3>
                  <p className="text-gray-300 text-sm">Programmatically generated planet textures using HTML5 Canvas for authentic surface appearance.</p>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Performance</h3>
                  <p className="text-gray-300 text-sm">Optimized rendering with efficient geometry generation and texture caching for smooth 60fps animations.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border-blue-700 p-8">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">🚀 How to Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🃏</div>
                <h3 className="font-semibold mb-2">Card View</h3>
                <p className="text-gray-300 text-sm">Browse planets in enhanced 3D cards with individual planet viewers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌌</div>
                <h3 className="font-semibold mb-2">3D Solar System</h3>
                <p className="text-gray-300 text-sm">Explore the complete solar system in interactive 3D space</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-semibold mb-2">Planet Details</h3>
                <p className="text-gray-300 text-sm">Click any planet for detailed 3D view with scientific information</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PlanetShowcase;