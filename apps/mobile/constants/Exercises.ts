import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ComponentProps } from 'react';

export interface ExerciseData {
    id: string;
    name: string;
    muscleGroup: 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Core' | 'Cardio';
    equipment: string;
    description: string;
    benefits: string[];
    icon: ComponentProps<typeof FontAwesome>['name'];
}

export const EXERCISES: ExerciseData[] = [
    // Chest
    {
        id: 'bench_press',
        name: 'Supino Reto com Barra',
        muscleGroup: 'Peito',
        equipment: 'Barra, Banco',
        description: 'O rei dos exercícios de empurrar. Deite-se no banco plano e empurre a barra a partir do peito.',
        benefits: ['Aumenta massa do peitoral', 'Aumenta força de empurrar', 'Trabalha tríceps e deltoides anteriores'],
        icon: 'heartbeat'
    },
    {
        id: 'incline_dumbell_press',
        name: 'Supino Inclinado Halteres',
        muscleGroup: 'Peito',
        equipment: 'Halteres, Banco Inclinado',
        description: 'Supino com halteres em banco inclinado para focar na parte superior do peitoral.',
        benefits: ['Foca no peitoral superior', 'Melhora estabilidade dos ombros', 'Corrige desequilíbrios musculares'],
        icon: 'level-up'
    },
    {
        id: 'chest_fly',
        name: 'Crucifixo no Cabo',
        muscleGroup: 'Peito',
        equipment: 'Máquina de Cabo',
        description: 'Movimento isolado para o peito usando cabos para manter tensão constante.',
        benefits: ['Isola os músculos peitorais', 'Ótimo alongamento na fase excêntrica', 'Tensão constante'],
        icon: 'arrows-h'
    },

    // Back
    {
        id: 'deadlift',
        name: 'Levantamento Terra',
        muscleGroup: 'Costas',
        equipment: 'Barra',
        description: 'Exercício composto que trabalha toda a cadeia posterior. Levante a barra do chão até o quadril.',
        benefits: ['Constrói força total', 'Fortalece lombar e isquiotibiais', 'Melhora a pegada'],
        icon: 'bolt'
    },
    {
        id: 'pull_up',
        name: 'Barra Fixa',
        muscleGroup: 'Costas',
        equipment: 'Barra Fixa',
        description: 'Puxe o corpo para cima até que o queixo passe da barra.',
        benefits: ['Aumenta largura das costas', 'Força relativa', 'Trabalha bíceps e core'],
        icon: 'arrow-up'
    },
    {
        id: 'bent_over_row',
        name: 'Remada Curvada',
        muscleGroup: 'Costas',
        equipment: 'Barra',
        description: 'Reme a barra em direção ao tronco mantendo o corpo inclinado.',
        benefits: ['Espessa os músculos das costas', 'Melhora postura', 'Fortalece deltoides posteriores'],
        icon: 'anchor'
    },

    // Legs
    {
        id: 'squat',
        name: 'Agachamento Livre',
        muscleGroup: 'Pernas',
        equipment: 'Barra, Hack',
        description: 'O rei dos exercícios de perna. Apoie a barra no trapézio e agache até o quadril passar dos joelhos.',
        benefits: ['Constrói pernas maciças', 'Aumenta estabilidade do core', 'Estimula testosterona'],
        icon: 'tree'
    },
    {
        id: 'leg_press',
        name: 'Leg Press',
        muscleGroup: 'Pernas',
        equipment: 'Máquina Leg Press',
        description: 'Empurre o peso com as pernas enquanto está sentado.',
        benefits: ['Alto volume para pernas', 'Seguro para lombar', 'Isola quadríceps'],
        icon: 'compress'
    },
    {
        id: 'lunge',
        name: 'Avanço (Passada)',
        muscleGroup: 'Pernas',
        equipment: 'Halteres / Peso do Corpo',
        description: 'Dê um passo à frente e desça o quadril até ambos os joelhos dobrarem 90 graus.',
        benefits: ['Melhora equilíbrio', 'Foca em glúteos e quadríceps', 'Força unilateral'],
        icon: 'step-forward'
    },

    // Shoulders
    {
        id: 'overhead_press',
        name: 'Desenvolvimento Militar',
        muscleGroup: 'Ombros',
        equipment: 'Barra',
        description: 'Empurre a barra da clavícula até acima da cabeça estando em pé.',
        benefits: ['Massa nos deltoides', 'Estabilidade do core', 'Força funcional acima da cabeça'],
        icon: 'arrow-up'
    },
    {
        id: 'lateral_raise',
        name: 'Elevação Lateral',
        muscleGroup: 'Ombros',
        equipment: 'Halteres',
        description: 'Levante os halteres para os lados até que os braços estejam paralelos ao chão.',
        benefits: ['Isola deltoide lateral', 'Cria aspecto de ombro largo', 'Alarga a silhueta'],
        icon: 'arrows-h'
    },

    // Arms
    {
        id: 'barbell_curl',
        name: 'Rosca Direta',
        muscleGroup: 'Braços',
        equipment: 'Barra',
        description: 'Flexione a barra em direção ao peito mantendo os cotovelos fixos.',
        benefits: ['Massa no bíceps', 'Permite carga alta', 'Simples e eficaz'],
        icon: 'hand-rock-o'
    },
    {
        id: 'tricep_pushdown',
        name: 'Tríceps Pulley',
        muscleGroup: 'Braços',
        equipment: 'Máquina de Cabo',
        description: 'Empurre o cabo para baixo até estender totalmente os braços.',
        benefits: ['Isola tríceps', 'Fácil ajuste de carga', 'Ótimo pump'],
        icon: 'arrow-down'
    },

    // Core
    {
        id: 'plank',
        name: 'Prancha Abdominal',
        muscleGroup: 'Core',
        equipment: 'Peso do Corpo',
        description: 'Segure a posição de flexão apoiado nos cotovelos.',
        benefits: ['Força isométrica do core', 'Protege a lombar', 'Melhora postura'],
        icon: 'minus'
    },
];
