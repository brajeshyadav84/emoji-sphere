import React from 'react';
import { SolarSystem } from './solar';
import { PlanetProvider } from '@/store/planetStore';
import Header from '@/components/Header';

const PlanetsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <PlanetProvider>
        <SolarSystem />
      </PlanetProvider>
    </div>
  );
};

export default PlanetsPage;