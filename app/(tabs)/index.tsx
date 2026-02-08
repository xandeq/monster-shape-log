import { MonsterCoach } from '@/components/MonsterCoach';

// ... existing imports

export default function DashboardScreen() {
  // ... existing code

        </View>

        {/* AI Monster Coach Widget */}
        <MonsterCoach />

        <MonsterCard title="Dica do Dia">
          <Text style={styles.tipText}>"A dor é apenas a fraqueza saindo do corpo. Empurre mais forte hoje."</Text>
        </MonsterCard>

        <ProgressModal
            visible={progressModalVisible}
            onClose={() => setProgressModalVisible(false)}
        />

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  headerLogo: {
      width: 50,
      height: 50,
  },
  greeting: {
    fontSize: 14,
    color: MonsterColors.textSecondary,
    marginBottom: 4,
    letterSpacing: 2,
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MonsterColors.text,
    fontStyle: 'italic',
  },
  // Active Workout Styles
  activeWorkoutCard: {
      marginBottom: 24,
      backgroundColor: MonsterColors.secondary, // Navy Blue
      borderWidth: 1,
      borderColor: MonsterColors.primary, // Yellow border
  },
  activeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  activeLabel: {
      color: MonsterColors.primary, // Pink
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
      letterSpacing: 1,
  },
  activeTitle: {
      color: '#ffffff', // White text
      fontSize: 20,
      fontWeight: 'bold',
  },
  activeTimer: {
      color: '#ffffff', // White text
      fontSize: 24,
      fontFamily: 'SpaceMono',
  },
  // Key Stats
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: MonsterColors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MonsterColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: MonsterColors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MonsterColors.text,
    marginBottom: 12,
    letterSpacing: 1,
  },
  // Grid Widgets
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  icon: {
    marginBottom: 8,
    alignSelf: 'center',
  },
  gridContent: {
      alignItems: 'center',
      marginBottom: 12,
  },
  gridLabel: {
      color: MonsterColors.success,
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 2,
  },
  gridValue: {
      color: MonsterColors.text,
      fontSize: 20,
      fontWeight: 'bold',
  },
  gridValueSmall: {
      color: MonsterColors.text,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  microText: {
    color: MonsterColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  gridDate: {
      color: MonsterColors.textSecondary,
      fontSize: 10,
  },
  microButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 0,
    height: 32,
  },
  tipText: {
    color: MonsterColors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
