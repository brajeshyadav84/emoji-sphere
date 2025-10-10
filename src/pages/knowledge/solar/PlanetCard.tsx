import React, { useRef, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Ring, Stars, OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import { Planet } from '@/data/planets';
import { Card } from '@/components/ui/card';
import { usePlanetStore } from '@/store/planetStore';
import * as THREE from 'three';

interface PlanetCardProps {
  planet: Planet;
  isSelected: boolean;
}

// Memoized 3D Planet Component for better performance
const Planet3D: React.FC<{ planet: Planet; isSelected: boolean }> = React.memo(({ planet, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Create planet surface texture based on planet type
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    switch (planet.id) {
      case 'mercury':
        gradient.addColorStop(0, '#8C7853');
        gradient.addColorStop(0.5, '#B8A082');
        gradient.addColorStop(1, '#6B5D45');
        break;
      case 'venus':
        gradient.addColorStop(0, '#FFC649');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FF8C00');
        break;
      case 'earth':
        gradient.addColorStop(0, '#6B93D6');
        gradient.addColorStop(0.3, '#4682B4');
        gradient.addColorStop(0.6, '#228B22');
        gradient.addColorStop(1, '#8FBC8F');
        break;
      case 'mars':
        gradient.addColorStop(0, '#CD5C5C');
        gradient.addColorStop(0.5, '#B22222');
        gradient.addColorStop(1, '#8B0000');
        break;
      case 'jupiter':
        gradient.addColorStop(0, '#D8CA9D');
        gradient.addColorStop(0.2, '#F4A460');
        gradient.addColorStop(0.5, '#DEB887');
        gradient.addColorStop(0.8, '#CD853F');
        gradient.addColorStop(1, '#A0522D');
        break;
      case 'saturn':
        gradient.addColorStop(0, '#FAD5A5');
        gradient.addColorStop(0.5, '#F0E68C');
        gradient.addColorStop(1, '#DEB887');
        break;
      case 'uranus':
        gradient.addColorStop(0, '#4FD0E7');
        gradient.addColorStop(0.5, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        break;
      case 'neptune':
        gradient.addColorStop(0, '#4B70DD');
        gradient.addColorStop(0.5, '#0000FF');
        gradient.addColorStop(1, '#191970');
        break;
      default:
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(1, planet.color);
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some surface details
    context.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 20 + 5;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = i % 2 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
      context.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [planet]);

  const size = Math.max(0.8, Math.min(2, planet.size / 100));

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 5]} intensity={1} />
      
      {/* Planet */}
      <Sphere ref={meshRef} args={[size, 32, 32]} position={[0, 0, 0]}>
        <meshPhongMaterial 
          map={planetTexture} 
          shininess={planet.id === 'earth' ? 100 : 30}
          transparent={true}
          opacity={0.95}
        />
      </Sphere>
      
      {/* Atmosphere for Earth */}
      {planet.id === 'earth' && (
        <Sphere args={[size * 1.02, 32, 32]} position={[0, 0, 0]}>
          <meshPhongMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
      
      {/* Rings for Saturn */}
      {planet.id === 'saturn' && (
        <>
          <Ring 
            ref={ringRef}
            args={[size * 1.5, size * 2.2, 64]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial 
              color="#FAD5A5" 
              transparent={true} 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
          <Ring 
            args={[size * 1.3, size * 1.4, 64]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial 
              color="#DEB887" 
              transparent={true} 
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </Ring>
        </>
      )}
      
      {/* Jupiter's Great Red Spot */}
      {planet.id === 'jupiter' && (
        <Sphere args={[size * 0.2, 16, 16]} position={[size * 0.7, 0, 0]}>
          <meshPhongMaterial color="#B22222" transparent={true} opacity={0.8} />
        </Sphere>
      )}
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade={true} />
    </group>
  );
});

Planet3D.displayName = 'Planet3D';

// Loading fallback component
const LoadingPlanet: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

export const PlanetCard: React.FC<PlanetCardProps> = ({ planet, isSelected }) => {
  const { setSelectedPlanet, setDetailOpen } = usePlanetStore();

  const handleClick = () => {
    setSelectedPlanet(planet.id);
    setDetailOpen(true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
          isSelected ? 'ring-2 ring-blue-500 scale-105' : ''
        }`}
        onClick={handleClick}
        style={{
          background: `linear-gradient(135deg, ${planet.color}20, ${planet.color}40)`,
          borderColor: planet.color,
        }}
      >
        <div className="p-6 text-center">
          {/* Enhanced 3D Planet Visual with Suspense */}
          <div className="relative mb-4 flex justify-center">
            <div 
              className="rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{
                width: '160px',
                height: '160px',
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.8), rgba(0,0,0,0.95))',
                boxShadow: `0 0 30px ${planet.color}40`,
              }}
            >
              <Suspense fallback={<LoadingPlanet />}>
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <Planet3D planet={planet} isSelected={isSelected} />
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={2}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>

          {/* Enhanced Planet Info */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">{planet.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{planet.subtitle}</p>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Distance: {planet.distance}M km</span>
            <span>Moons: {planet.stats.moons}</span>
          </div>
          <div className="text-xs text-gray-500">
            Diameter: {planet.stats.diameter}
          </div>
          
          {/* Planet-specific indicators */}
          <div className="mt-3 flex justify-center gap-1">
            {planet.id === 'earth' && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">🌍 Home</span>}
            {planet.id === 'saturn' && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">🪐 Rings</span>}
            {planet.id === 'jupiter' && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">🌪️ Giant</span>}
            {planet.id === 'mars' && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">🔴 Red</span>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};