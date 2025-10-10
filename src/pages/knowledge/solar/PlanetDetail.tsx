import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Ring, OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Planet } from '@/data/planets';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePlanetStore } from '@/store/planetStore';
import * as THREE from 'three';

interface PlanetDetailProps {
  planet: Planet | null;
}

// 3D Planet for Detail View
const DetailPlanet3D: React.FC<{ planet: Planet }> = ({ planet }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.1;
    }
  });

  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Create detailed planet surface texture
    const gradient = context.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.3, 0,
      canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.8
    );
    
    switch (planet.id) {
      case 'mercury':
        gradient.addColorStop(0, '#B8A082');
        gradient.addColorStop(0.5, '#8C7853');
        gradient.addColorStop(1, '#6B5D45');
        break;
      case 'venus':
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFC649');
        gradient.addColorStop(1, '#FF8C00');
        break;
      case 'earth':
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#6B93D6');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(0.7, '#8FBC8F');
        gradient.addColorStop(1, '#4682B4');
        break;
      case 'mars':
        gradient.addColorStop(0, '#FF6347');
        gradient.addColorStop(0.5, '#CD5C5C');
        gradient.addColorStop(1, '#8B0000');
        break;
      case 'jupiter':
        gradient.addColorStop(0, '#F4A460');
        gradient.addColorStop(0.2, '#D8CA9D');
        gradient.addColorStop(0.5, '#DEB887');
        gradient.addColorStop(0.8, '#CD853F');
        gradient.addColorStop(1, '#A0522D');
        break;
      case 'saturn':
        gradient.addColorStop(0, '#F0E68C');
        gradient.addColorStop(0.5, '#FAD5A5');
        gradient.addColorStop(1, '#DEB887');
        break;
      case 'uranus':
        gradient.addColorStop(0, '#B0E0E6');
        gradient.addColorStop(0.5, '#4FD0E7');
        gradient.addColorStop(1, '#4682B4');
        break;
      case 'neptune':
        gradient.addColorStop(0, '#6495ED');
        gradient.addColorStop(0.5, '#4B70DD');
        gradient.addColorStop(1, '#191970');
        break;
      default:
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(1, planet.color);
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add surface details
    context.globalAlpha = 0.4;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 5;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.3)' : 
                        i % 3 === 1 ? 'rgba(0,0,0,0.3)' : 
                        'rgba(128,128,128,0.2)';
      context.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [planet]);

  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#4444ff" />
      
      {/* Planet */}
      <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial 
          map={planetTexture} 
          shininess={planet.id === 'earth' ? 100 : 30}
          transparent={true}
          opacity={0.95}
        />
      </Sphere>
      
      {/* Atmosphere for Earth */}
      {planet.id === 'earth' && (
        <Sphere args={[2.05, 64, 64]} position={[0, 0, 0]}>
          <meshPhongMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
      
      {/* Rings for Saturn */}
      {planet.id === 'saturn' && (
        <>
          <Ring 
            ref={ringRef}
            args={[3, 4.5, 128]} 
            rotation={[Math.PI / 2.2, 0, 0]}
          >
            <meshBasicMaterial 
              color="#FAD5A5" 
              transparent={true} 
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </Ring>
          <Ring 
            args={[2.5, 2.8, 64]} 
            rotation={[Math.PI / 2.2, 0, 0]}
          >
            <meshBasicMaterial 
              color="#DEB887" 
              transparent={true} 
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </Ring>
        </>
      )}
      
      {/* Jupiter's Great Red Spot */}
      {planet.id === 'jupiter' && (
        <Sphere args={[0.4, 32, 32]} position={[1.5, 0, 0]}>
          <meshPhongMaterial color="#B22222" transparent={true} opacity={0.9} />
        </Sphere>
      )}
      
      {/* Stars background */}
      <Stars radius={50} depth={20} count={2000} factor={2} saturation={0} fade={true} />
    </group>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const PlanetDetail: React.FC<PlanetDetailProps> = ({ planet }) => {
  const { isDetailOpen, setDetailOpen } = usePlanetStore();

  if (!planet) return null;

  return (
    <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <motion.div 
            className="flex items-center gap-6 mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 3D Planet View */}
            <div 
              className="rounded-lg shadow-lg"
              style={{
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.8), rgba(0,0,0,0.95))',
                boxShadow: `0 0 40px ${planet.color}60`,
              }}
            >
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <DetailPlanet3D planet={planet} />
                <OrbitControls 
                  enableZoom={true} 
                  enablePan={false}
                  autoRotate={true}
                  autoRotateSpeed={1}
                  minDistance={5}
                  maxDistance={15}
                />
              </Canvas>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold">{planet.name}</DialogTitle>
              <DialogDescription className="text-lg text-gray-600 mb-3">
                {planet.subtitle}
              </DialogDescription>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" style={{ backgroundColor: `${planet.color}20`, color: planet.color }}>
                  {planet.stats.diameter}
                </Badge>
                <Badge variant="outline">
                  {planet.stats.moons} moon{planet.stats.moons !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline">
                  {planet.distance}M km from Sun
                </Badge>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Description */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">About {planet.name}</h3>
                <p className="text-gray-700 leading-relaxed">{planet.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Planet Statistics */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Planet Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(planet.stats).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      className="text-center p-3 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="font-semibold">{value}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interesting Facts */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Interesting Facts</h3>
                <div className="space-y-3">
                  {planet.facts.map((fact, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Badge variant="outline" className="mt-1">
                        {index + 1}
                      </Badge>
                      <p className="text-gray-700">{fact}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Planet Comparison */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Size Comparison</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Earth</div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      className="rounded-full mx-auto"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'radial-gradient(circle at 30% 30%, #6B93D6ff, #6B93D680)',
                      }}
                    />
                  </div>
                  <div className="text-2xl text-gray-400">vs</div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{planet.name}</div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: planet.id === 'mercury' ? 59 : planet.id === 'venus' ? 243 : 1,
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="rounded-full mx-auto"
                      style={{
                        width: Math.max(20, Math.min(120, planet.size * 0.6)) + 'px',
                        height: Math.max(20, Math.min(120, planet.size * 0.6)) + 'px',
                        background: `radial-gradient(circle at 30% 30%, ${planet.color}ff, ${planet.color}80)`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};