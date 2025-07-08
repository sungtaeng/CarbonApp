// screens/ChartScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../components/common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../styles/commonStyles';

export const ChartScreen = ({ realTimeData, predictionData }) => {
  return (
    <View style={styles.container}>
      <View style={commonStyles.section}>
        <View style={commonStyles.card}>
          <Text style={styles.title}>실시간 차트</Text>
          <RealTimeLineChart 
            data={realTimeData} 
            color={colors.primary} 
            animated 
            height={200}
          />
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.card}>
          <Text style={styles.title}>예측 차트</Text>
          <RealTimeLineChart 
            data={predictionData} 
            color={colors.secondary} 
            animated 
            height={200}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.lg,
  },
});