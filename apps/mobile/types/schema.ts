export interface Profile {
    id: string;
    user_id: string; // usually same as id in this schema
    full_name?: string;
    avatar_url?: string;
    age?: number;
    gender?: 'Masculino' | 'Feminino' | 'Outro' | string;
    height?: number; // in cm
    weight?: number; // in kg
    goal?: 'Ganho de massa' | 'Emagrecimento' | 'Manutenção' | string;
    training_level?: 'Iniciante' | 'Intermediário' | 'Avançado' | string;
    restrictions?: string;
    notes?: string;
    updated_at?: string;
}

export interface UserMeasurement {
    id: string;
    user_id: string;
    measurement_type: 'Peito' | 'Braço' | 'Cintura' | 'Quadril' | 'Coxa' | 'Panturrilha' | string;
    value: number;
    recorded_at: string;
}
