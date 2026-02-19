import { supabase } from '@/lib/supabase';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

export interface BodyMeasurement {
  id: string;
  date: string; // ISO string
  weight: number; // kg
  bodyFat?: number; // %
  chest?: number; // cm
  waist?: number; // cm
  arms?: number; // cm
  legs?: number; // cm
}

export interface ProgressPhoto {
  id: string;
  date: string; // ISO string
  uri: string;
  label: 'Front' | 'Back' | 'Side' | 'Other';
}

interface ProgressContextType {
  measurements: BodyMeasurement[];
  photos: ProgressPhoto[];
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  deleteMeasurement: (id: string) => void;
  addPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  deletePhoto: (id: string) => void;
  getLatestWeight: () => number | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  useEffect(() => {
      if (session?.user) {
          fetchProgress();
      } else {
          setMeasurements([]);
          setPhotos([]);
      }
  }, [session]);

  const fetchProgress = async () => {
      try {
          if (!session?.user) return;

          // Fetch Measurements
          const { data: mData } = await supabase
            .from('measurements')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

          if (mData) {
             setMeasurements(mData.map((m: any) => ({
                 id: m.id,
                 date: m.date,
                 weight: Number(m.weight),
                 bodyFat: m.body_fat ? Number(m.body_fat) : undefined,
                 chest: m.chest ? Number(m.chest) : undefined,
                 waist: m.waist ? Number(m.waist) : undefined,
                 arms: m.arms ? Number(m.arms) : undefined,
                 legs: m.legs ? Number(m.legs) : undefined,
             })));
          }

          // Fetch Photos
          const { data: pData } = await supabase
            .from('photos')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

          if (pData) {
              setPhotos(pData.map((p: any) => ({
                  id: p.id,
                  date: p.date,
                  uri: p.uri,
                  label: p.label
              })));
          }

      } catch (error) {
          console.error("Error fetching progress:", error);
          Alert.alert("Erro", "Falha ao carregar o progresso.");
      }
  };

  const addMeasurement = async (measurement: Omit<BodyMeasurement, 'id'>) => {
    if (!session?.user) return;
    try {
        const { data, error } = await supabase
            .from('measurements')
            .insert([{
                user_id: session.user.id,
                date: measurement.date,
                weight: measurement.weight,
                body_fat: measurement.bodyFat,
                chest: measurement.chest,
                waist: measurement.waist,
                arms: measurement.arms,
                legs: measurement.legs,
            }])
            .select()
            .single();

        if (error) throw error;

        const newMeasurement = {
            ...measurement,
            id: data.id
        };
        setMeasurements(prev => [newMeasurement, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        Alert.alert("Erro", "Falha ao salvar medidas.");
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      const { error } = await supabase.from('measurements').delete().eq('id', id);
      if (error) throw error;
      setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      Alert.alert("Erro", "Falha ao deletar medida.");
    }
  };

  const addPhoto = async (photo: Omit<ProgressPhoto, 'id'>) => {
    if (!session?.user) return;
    try {
        const { data, error } = await supabase
            .from('photos')
            .insert([{
                user_id: session.user.id,
                date: photo.date,
                uri: photo.uri,
                label: photo.label
            }])
            .select()
            .single();

        if (error) throw error;

        const newPhoto = { ...photo, id: data.id };
        setPhotos(prev => [newPhoto, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        Alert.alert("Erro", "Falha ao salvar foto.");
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      Alert.alert("Erro", "Falha ao deletar foto.");
    }
  };

  const getLatestWeight = () => {
      if (measurements.length === 0) return null;
      return measurements[0].weight;
  };

  return (
    <ProgressContext.Provider value={{
      measurements,
      photos,
      addMeasurement,
      deleteMeasurement,
      addPhoto,
      deletePhoto,
      getLatestWeight
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
