import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RescueRequestStep1, RescueRequestStep2, FullRescueRequest } from '../types/rescue.types';

interface RescueContextType {
  step1Data: RescueRequestStep1 | null;
  step2Data: RescueRequestStep2 | null;
  setStep1: (data: RescueRequestStep1) => void;
  setStep2: (data: RescueRequestStep2) => void;
  reset: () => void;
  getSummary: () => FullRescueRequest | null;
}

const RescueContext = createContext<RescueContextType | undefined>(undefined);

export const RescueProvider = ({ children }: { children: ReactNode }) => {
  const [step1Data, setStep1Data] = useState<RescueRequestStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<RescueRequestStep2 | null>(null);

  const setStep1 = (data: RescueRequestStep1) => setStep1Data(data);
  const setStep2 = (data: RescueRequestStep2) => setStep2Data(data);
  const reset = () => {
    setStep1Data(null);
    setStep2Data(null);
  };

  const getSummary = () => {
    if (!step1Data || !step2Data) return null;
    return {
      ...step1Data,
      ...step2Data,
      images: [] // Images will be added in Step 3
    };
  };

  return (
    <RescueContext.Provider value={{ step1Data, step2Data, setStep1, setStep2, reset, getSummary }}>
      {children}
    </RescueContext.Provider>
  );
};

export const useRescueContext = () => {
  const context = useContext(RescueContext);
  if (context === undefined) {
    throw new Error('useRescueContext must be used within a RescueProvider');
  }
  return context;
};
