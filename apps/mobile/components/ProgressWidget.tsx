import { MonsterCard } from '@/components/MonsterCard';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface ProgressionData {
  suggested_weight: number | null;
  suggested_reps: string;
  message: string;
  history_stats: {
    last_1rm: string;
    last_max_weight: number;
    volume: number;
    avg_1rm?: string | null;
  } | null;
}

interface ProgressWidgetProps {
  data: ProgressionData | null;
  loading: boolean;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <MonsterCard className="mb-4 bg-elevated/50 border-dashed border-border" noPadding>
        <View className="p-4 flex-row items-center justify-center space-x-2">
            <FontAwesome name="circle-o-notch" size={20} color={MonsterColors.accent} style={{ marginRight: 10 }} />
            <MonsterText variant="body" className="text-text-muted italic">ANALISANDO HISTÓRICO...</MonsterText>
        </View>
      </MonsterCard>
    );
  }

  if (!data) return null;

  return (
    <MonsterCard className="mb-4 border-accent" noPadding>
      <View className="bg-accent/20 p-3 border-b border-accent/20 flex-row items-center">
        <FontAwesome name="line-chart" size={16} color={MonsterColors.accent} style={{ marginRight: 8 }} />
        <MonsterText variant="titleSm" className="text-accent">MONSTER COACH</MonsterText>
      </View>

      <View className="p-4">
        <MonsterText variant="body" className="text-white mb-3 italic">"{data.message}"</MonsterText>

        <View className="flex-row justify-between items-center rounded-lg bg-background p-3 border border-border">
             <View className="items-center flex-1 border-r border-border">
                <MonsterText variant="tiny" className="text-text-muted mb-1">CARGA SUGERIDA</MonsterText>
                <MonsterText variant="titleLg" neon>
                    {data.suggested_weight ? `${data.suggested_weight}kg` : '--'}
                </MonsterText>
             </View>

             <View className="items-center flex-1">
                <MonsterText variant="tiny" className="text-text-muted mb-1">REPO RANGE</MonsterText>
                <MonsterText variant="titleLg" className="text-white">
                    {data.suggested_reps}
                </MonsterText>
             </View>
        </View>

        {data.history_stats && (
            <View className="mt-3 flex-row justify-between items-center">
                <MonsterText variant="tiny" className="text-text-muted">
                    ÚLTIMO 1RM EM: {data.history_stats.last_1rm}kg
                </MonsterText>
                {data.history_stats.avg_1rm && (
                     <View className="flex-row items-center">
                        <MonsterText variant="tiny" className="text-text-muted mr-1">
                            MÉDIA ANTERIOR: {data.history_stats.avg_1rm}kg
                        </MonsterText>
                        <FontAwesome
                            name={parseFloat(data.history_stats.last_1rm) >= parseFloat(data.history_stats.avg_1rm) ? "arrow-up" : "arrow-down"}
                            size={10}
                            color={parseFloat(data.history_stats.last_1rm) >= parseFloat(data.history_stats.avg_1rm) ? MonsterColors.success : MonsterColors.error}
                        />
                     </View>
                )}
            </View>
        )}
      </View>
    </MonsterCard>
  );
};
