import { MonsterCard } from '@/components/MonsterCard';
import { MonsterColors } from '@/constants/Colors';
import { useProgress } from '@/context/ProgressContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressWidgetProps {
  onPress: () => void;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ onPress }) => {
  const { measurements } = useProgress();

  const latestWeight = measurements.length > 0 ? measurements[0].weight : 0;
  const startWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : 0;
  const change = latestWeight - startWeight;

  // Prepare tiny chart data (reverse for chronological order)
  const chartData = {
      labels: [],
      datasets: [
          {
              data: measurements.length > 1
                ? measurements.slice(0, 5).reverse().map(m => m.weight)
                : [0, 0]
          }
      ]
  };

  return (
    <TouchableOpacity onPress={onPress}>
        <MonsterCard title="Estatísticas do Corpo" style={styles.card}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.mainValue}>{latestWeight} kg</Text>
                    <View style={styles.trendRow}>
                        <FontAwesome
                            name={change <= 0 ? "caret-down" : "caret-up"}
                            size={16}
                            color={change <= 0 ? MonsterColors.success : MonsterColors.warning} // Losing weight usually good?
                        />
                        <Text style={[
                            styles.trendText,
                            { color: change <= 0 ? MonsterColors.success : MonsterColors.warning }
                        ]}>
                            {Math.abs(change).toFixed(1)} kg
                        </Text>
                    </View>
                </View>

                {measurements.length > 1 && (
                    <LineChart
                        data={chartData}
                        width={120}
                        height={60}
                        withDots={false}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={false}
                        withHorizontalLabels={false}
                        chartConfig={{
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientToOpacity: 0,
                            color: (opacity = 1) => MonsterColors.primary,
                            strokeWidth: 2,
                        }}
                        bezier
                        style={{ paddingRight: 0 }}
                    />
                )}
            </View>
        </MonsterCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
      marginBottom: 24,
  },
  content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  mainValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: MonsterColors.text,
  },
  trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  trendText: {
      fontSize: 14,
      fontWeight: 'bold',
  }
});
