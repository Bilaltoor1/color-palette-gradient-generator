"use client";

import { createContext, useContext, useState } from 'react';

const GradientControlsContext = createContext();

export function GradientControlsProvider({ children }) {
  const [rgbShuffle, setRgbShuffle] = useState("rgb");
  const [offset, setOffset] = useState({ r: 0, g: 0, b: 0 });
  const [angle, setAngle] = useState(90);
  const [type, setType] = useState("linear");

  const value = {
    rgbShuffle,
    setRgbShuffle,
    offset,
    setOffset,
    angle,
    setAngle,
    type,
    setType
  };

  return (
    <GradientControlsContext.Provider value={value}>
      {children}
    </GradientControlsContext.Provider>
  );
}

export function useGradientControls() {
  const context = useContext(GradientControlsContext);
  if (!context) {
    throw new Error('useGradientControls must be used within a GradientControlsProvider');
  }
  return context;
}
