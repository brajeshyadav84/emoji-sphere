import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type ShapeInfo = {
    id: string;
    name: string;
    vertices: number;
    edges: number;
    position: [number, number, number];
    color: string;
    sides?: number;
    description?: string;
    // Optional formula strings for area (2D) and volume (3D)
    areaFormula?: string;
    volumeFormula?: string;
    primitive?: 'cube' | 'sphere' | 'cone';
    points?: [number, number][]; // custom 2D points for polygon
};

const shapes: ShapeInfo[] = [
    { id: 'rect', name: 'Rectangle', vertices: 4, edges: 4, position: [-6, 0, 0], color: '#60A5FA', description: 'Like a door or a book', areaFormula: 'A = width × height' },
    { id: 'square', name: 'Square', vertices: 4, edges: 4, position: [-4, 0, 0], color: '#FB923C', sides: 4, description: 'All sides equal', areaFormula: 'A = a²' },
    { id: 'triangle', name: 'Triangle', vertices: 3, edges: 3, position: [-2, 0, 0], color: '#FBCFE8', sides: 3, description: 'Three sided shape (e.g., roof)', areaFormula: "A = ½ × base × height" },
    { id: 'circle', name: 'Circle', vertices: 0, edges: 0, position: [-0.5, 0, 0], color: '#34D399', description: 'Round shape like a wheel', areaFormula: 'A = πr²' },
    { id: 'pentagon', name: 'Pentagon', vertices: 5, edges: 5, position: [1.5, 0, 0], color: '#F472B6', sides: 5, description: 'Five sided shape', areaFormula: 'A = (1/4)√(5(5+2√5)) × a²' },
    { id: 'hex', name: 'Hexagon', vertices: 6, edges: 6, position: [3.5, 0, 0], color: '#A78BFA', sides: 6, description: 'Honeycomb cell', areaFormula: 'A = (3√3/2) × a²' },
    { id: 'heptagon', name: 'Heptagon', vertices: 7, edges: 7, position: [5.5, 0, 0], color: '#60A5FA', sides: 7, description: 'Seven sided polygon', areaFormula: 'A ≈ (7/4) × a² × cot(π/7)' },

    // second row
    { id: 'octagon', name: 'Octagon', vertices: 8, edges: 8, position: [-5.5, -1.8, 0], color: '#F97316', sides: 8, description: 'Eight sided (stop sign)', areaFormula: 'A = 2(1+√2) × a²' },
    { id: 'star', name: 'Star', vertices: 10, edges: 10, position: [-3.5, -1.8, 0], color: '#FDE047', description: 'Five-point star', areaFormula: 'Varies by construction' },
    { id: 'trapezoid', name: 'Trapezoid', vertices: 4, edges: 4, position: [-1.5, -1.8, 0], color: '#60A5FA', description: 'One pair of parallel sides', points: [[-1, -0.6], [1, -0.6], [0.6, 0.6], [-0.6, 0.6]], areaFormula: 'A = ½ × (b1 + b2) × h' },
    { id: 'ellipse', name: 'Ellipse', vertices: 0, edges: 0, position: [0.5, -1.8, 0], color: '#34D399', description: 'Oval shape like an egg', areaFormula: 'A = πab' },
    { id: 'cube', name: 'Cube', vertices: 8, edges: 12, position: [2.5, -1.8, 0], color: '#3B82F6', primitive: 'cube', description: '3D cube - like a dice', areaFormula: 'Surface Area = 6a²', volumeFormula: 'V = a³' },
    { id: 'sphere', name: 'Sphere', vertices: 0, edges: 0, position: [4.5, -1.8, 0], color: '#10B981', primitive: 'sphere', description: '3D ball', areaFormula: 'Surface Area = 4πr²', volumeFormula: 'V = (4/3)πr³' },
    { id: 'cone', name: 'Cone', vertices: 1, edges: 1, position: [6.5, -1.8, 0], color: '#EF4444', primitive: 'cone', description: '3D cone - like an ice cream', areaFormula: 'Surface Area = πr(r + √(r² + h²))', volumeFormula: 'V = (1/3)πr²h' },
];

function Rotating({ children }: { children: React.ReactNode }) {
    const ref = useRef<THREE.Group | null>(null);
    useFrame((state, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.5;
    });
    return <group ref={ref}>{children}</group>;
}

function RectangleMesh({ color, onClick }: { color: string; onClick: () => void }) {
    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <boxGeometry args={[1.6, 0.1, 1]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function CircleMesh({ color, onClick }: { color: string; onClick: () => void }) {
    // Use a cylinder with many segments to look like a circle/coin
    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <cylinderGeometry args={[0.9, 0.9, 0.1, 64]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function HexagonMesh({ color, onClick }: { color: string; onClick: () => void }) {
    // Create a flat hexagon shape using Shape and ExtrudeGeometry
    const shape = React.useMemo(() => {
        const s = new THREE.Shape();
        const r = 0.9;
        for (let i = 0; i < 6; i++) {
            const theta = (i / 6) * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        }
        s.closePath();
        return s;
    }, []);

    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function PolygonMesh({ sides = 3, color, onClick }: { sides?: number; color: string; onClick: () => void }) {
    const shape = React.useMemo(() => {
        const s = new THREE.Shape();
        const r = 0.9;
        for (let i = 0; i < sides; i++) {
            const theta = (i / sides) * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        }
        s.closePath();
        return s;
    }, [sides]);

    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function StarMesh({ points = 5, color, onClick }: { points?: number; color: string; onClick: () => void }) {
    const shape = React.useMemo(() => {
        const s = new THREE.Shape();
        const outer = 0.9;
        const inner = 0.4;
        const n = points;
        for (let i = 0; i < n * 2; i++) {
            const theta = (i / (n * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? outer : inner;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        }
        s.closePath();
        return s;
    }, [points]);

    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function CustomShapeMesh({ points, color, onClick }: { points: [number, number][] | undefined; color: string; onClick: () => void }) {
    const shape = React.useMemo(() => {
        const s = new THREE.Shape();
        if (!points || points.length === 0) return s;
        points.forEach((p, i) => {
            const [x, y] = p;
            if (i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        });
        s.closePath();
        return s;
    }, [points]);

    return (
        <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
            <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function PrimitiveMesh({ primitive, color, onClick }: { primitive?: string; color: string; onClick: () => void }) {
    if (primitive === 'cube') {
        return (
            <mesh onClick={onClick} rotation-x={-Math.PI / 6} rotation-y={Math.PI / 6}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>
        );
    }
    if (primitive === 'sphere') {
        return (
            <mesh onClick={onClick}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
        );
    }
    if (primitive === 'cone') {
        return (
            <mesh onClick={onClick} rotation-x={-Math.PI / 2}>
                <coneGeometry args={[0.9, 1.2, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
        );
    }
    return null;
}

export default function ShapeExplorer() {
    const [selected, setSelected] = useState<ShapeInfo | null>(null);

    // keyboard navigation index for names bar
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    return (
        <div style={{ width: '100%', borderRadius: 8, overflow: 'hidden', background: '#FAFAFA' }}>
            {/* Top names bar - simplified, no heavy animation */}
            <div style={{ display: 'flex', gap: 8, padding: 8, overflowX: 'auto', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                {shapes.map((s, idx) => {
                    const isActive = selected?.id === s.id;
                    const isFocused = focusedIndex === idx;
                    return (
                        <button
                            key={s.id}
                            onClick={() => { setSelected(s); setFocusedIndex(idx); }}
                            onFocus={() => setFocusedIndex(idx)}
                            onBlur={() => setFocusedIndex((fi) => (fi === idx ? null : fi))}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 999,
                                border: isActive ? '2px solid #111827' : '1px solid rgba(0,0,0,0.06)',
                                background: isActive ? '#111827' : isFocused ? '#F9FAFB' : 'white',
                                color: isActive ? 'white' : '#111827',
                                fontWeight: isActive ? 700 : 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontSize: 14
                            }}
                            aria-pressed={isActive}
                            aria-label={`Show ${s.name}`}
                        >
                            {s.name}
                        </button>
                    );
                })}
                <div style={{ flex: '0 0 8px' }} />
            </div>

            {/* Responsive container: Canvas on top, details below on small screens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
                <div style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                    <Canvas camera={{ position: [0, 3, 6], fov: 50 }} style={{ width: '100%', height: '100%' }}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 10, 5]} intensity={0.8} />

                        {/* Render only selected if one chosen, otherwise show all but keep meshes static (no rotation) */}
                        {shapes
                            .filter((s) => (selected ? s.id === selected.id : true))
                            .map((s) => (
                                <group key={s.id} position={selected ? [0, 0, 0] : (s.position as any)}>
                                    {/* Render appropriate mesh */}
                                    {s.id === 'rect' && (
                                        <RectangleMesh color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {s.id === 'circle' && (
                                        <CircleMesh color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {/* Generic polygon for shapes with sides */}
                                    {s.sides && s.sides >= 3 && s.id !== 'hex' && (
                                        <PolygonMesh sides={s.sides} color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {/* hex keeps HexagonMesh (same as polygon but preserved) */}
                                    {s.id === 'hex' && (
                                        <HexagonMesh color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {s.id === 'star' && (
                                        <StarMesh points={5} color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {s.points && s.points.length > 0 && (
                                        <CustomShapeMesh points={s.points} color={s.color} onClick={() => setSelected(s)} />
                                    )}
                                    {s.primitive && (
                                        <PrimitiveMesh primitive={s.primitive} color={s.color} onClick={() => setSelected(s)} />
                                    )}

                                    {/* Simple Label */}
                                    <Html center distanceFactor={6} position={[0, 0.8, 0]}>
                                        <div style={{ textAlign: 'center', fontWeight: 700 }}>{s.name}</div>
                                    </Html>
                                </group>
                            ))}

                        {/* Keep controls lightweight: allow rotation but disable zoom on mobile via props if needed */}
                        <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
                    </Canvas>
                </div>

                {/* Details area - mobile first: shows details for selected shape, otherwise a short hint */}
                <div style={{ width: '100%', background: 'transparent' }}>
                    {selected ? (
                        <div style={{ background: 'white', padding: 12, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.name}</div>
                                    <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{selected.description}</div>
                                </div>
                                <div>
                                    <button onClick={() => setSelected(null)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)', background: 'white', cursor: 'pointer' }}>Close</button>
                                </div>
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', gap: 12, flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <div style={{ minWidth: 120 }}><strong>Vertices:</strong> {selected.vertices === 0 ? 'Continuous (circle)' : selected.vertices}</div>
                                    <div style={{ minWidth: 120 }}><strong>Edges:</strong> {selected.edges === 0 ? 'No straight edges (circle)' : selected.edges}</div>
                                    {selected.sides && <div style={{ minWidth: 120 }}><strong>Sides:</strong> {selected.sides}</div>}
                                    {selected.primitive && <div style={{ minWidth: 120 }}><strong>Type:</strong> {selected.primitive}</div>}
                                </div>

                                {/* Formulas: area (2D) and volume (3D) - shown when available */}
                                <div style={{ marginTop: 8 }}>
                                    {selected.areaFormula && (
                                        <div style={{ fontSize: 14, color: '#111827' }}><strong>Area:</strong> <span style={{ marginLeft: 6, color: '#374151' }}>{selected.areaFormula}</span></div>
                                    )}
                                    {selected.volumeFormula && (
                                        <div style={{ fontSize: 14, color: '#111827', marginTop: 6 }}><strong>Volume:</strong> <span style={{ marginLeft: 6, color: '#374151' }}>{selected.volumeFormula}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: 8, color: '#555' }}>Tap a shape name above or click a shape to view details. Designed to be simple and mobile friendly.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
