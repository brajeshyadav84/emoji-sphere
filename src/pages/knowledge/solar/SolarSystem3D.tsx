import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sphere, Ring } from '@react-three/drei';
import { planets, Planet } from '@/data/planets';
import { usePlanetStore } from '@/store/planetStore';
import * as THREE from 'three';

// Individual 3D Planet Component for the solar system
const Planet3D: React.FC<{ 
  planet: Planet; 
  distance: number; 
  speed: number;
  onClick: () => void;
}> = ({ planet, distance, speed, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
    }
  });

  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    switch (planet.id) {
      case 'mercury':
        gradient.addColorStop(0, '#8C7853');
        gradient.addColorStop(1, '#6B5D45');
        break;
      case 'venus':
        gradient.addColorStop(0, '#FFC649');
        gradient.addColorStop(1, '#FF8C00');
        break;
      case 'earth':
        gradient.addColorStop(0, '#6B93D6');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(1, '#4682B4');
        break;
      case 'mars':
        gradient.addColorStop(0, '#CD5C5C');
        gradient.addColorStop(1, '#8B0000');
        break;
      case 'jupiter':
        gradient.addColorStop(0, '#D8CA9D');
        gradient.addColorStop(0.5, '#F4A460');
        gradient.addColorStop(1, '#A0522D');
        break;
      case 'saturn':
        gradient.addColorStop(0, '#FAD5A5');
        gradient.addColorStop(1, '#DEB887');
        break;
      case 'uranus':
        gradient.addColorStop(0, '#4FD0E7');
        gradient.addColorStop(1, '#4682B4');
        break;
      case 'neptune':
        gradient.addColorStop(0, '#4B70DD');
        gradient.addColorStop(1, '#191970');
        break;
      default:
        gradient.addColorStop(0, planet.color);
        gradient.addColorStop(1, planet.color);
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  }, [planet]);

  const size = Math.max(0.1, Math.min(1, planet.size / 200));

  return (
    <group ref={groupRef}>
      <group position={[distance, 0, 0]} onClick={onClick}>
        <Sphere ref={meshRef} args={[size, 16, 16]}>
          <meshPhongMaterial map={planetTexture} />
        </Sphere>
        
        {/* Planet label */}
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {planet.name}
        </Text>
        
        {/* Saturn's rings */}
        {planet.id === 'saturn' && (
          <Ring args={[size * 1.2, size * 1.8, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#FAD5A5" transparent opacity={0.6} side={THREE.DoubleSide} />
          </Ring>
        )}
        
        {/* Earth's atmosphere */}
        {planet.id === 'earth' && (
          <Sphere args={[size * 1.02, 16, 16]}>
            <meshPhongMaterial color="#87CEEB" transparent opacity={0.1} side={THREE.BackSide} />
          </Sphere>
        )}
      </group>
      
      {/* Orbital path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
        <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Sun Component
const Sun: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#FDB813" />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color="yellow"
        anchorX="center"
        anchorY="middle"
      >
        SUN
      </Text>
    </group>
  );
};

export const SolarSystem3D: React.FC = () => {
  const { setSelectedPlanet, setDetailOpen } = usePlanetStore();

  const handlePlanetClick = (planetId: string) => {
    setSelectedPlanet(planetId);
    setDetailOpen(true);
  };

  // Calculate distances and speeds for realistic orbital mechanics
  const planetData = planets.map((planet, index) => ({
    ...planet,
    distance: (index + 1) * 2 + 3, // Scaled distance from sun
    speed: 1 / (index + 1), // Closer planets orbit faster
  }));

  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.1} />
        
        {/* Sun */}
        <Sun />
        
        {/* Planets */}
        {planetData.map((planet) => (
          <Planet3D
            key={planet.id}
            planet={planet}
            distance={planet.distance}
            speed={planet.speed}
            onClick={() => handlePlanetClick(planet.id)}
          />
        ))}
        
        {/* Background stars */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 🌍 Click planets for details</p>
      </div>
    </div>
  );
};