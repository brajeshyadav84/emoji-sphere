import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlanetContextType {
  selectedPlanet: string | null;
  isDetailOpen: boolean;
  setSelectedPlanet: (planetId: string | null) => void;
  setDetailOpen: (open: boolean) => void;
}

const PlanetContext = createContext<PlanetContextType | undefined>(undefined);

export const PlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  const value = {
    selectedPlanet,
    isDetailOpen,
    setSelectedPlanet,
    setDetailOpen
  };

  return React.createElement(PlanetContext.Provider, { value }, children);
};

export const usePlanetStore = () => {
  const context = useContext(PlanetContext);
  if (!context) {
    throw new Error('usePlanetStore must be used within a PlanetProvider');
  }
  return context;
};