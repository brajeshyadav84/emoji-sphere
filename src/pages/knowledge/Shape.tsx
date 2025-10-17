import React from 'react';
import ShapeExplorer from '@/education/ShapeExplorer';
import Header from '@/components/Header';

const Shape: React.FC = () => {
	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			<Header />
			<h1 className="text-2xl font-bold mb-2">Know Shapes</h1>
			<p className="text-gray-600 mb-4">Interactive explorer to learn about shapes, edges and vertices. Click a shape to learn more.</p>

			<ShapeExplorer />
		</div>
	);
};

export default Shape;
