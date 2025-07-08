// ========== 2. 주요 지표 ==========
// components/home/KeyIndicators.js
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const KeyIndicators = ({ indicators, onMorePress }) => {
  const handleIndicatorPress = (indicator) => {
    Alert.alert(
      indicator.title, 
      `현재 가격: ${indicator.value}\n변동률: ${indicator.change}`
    );
  };

  return (
    <View style={commonStyles.section}>
      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>주요 지표</Text>
        <TouchableOpacity onPress={() => onMorePress('주요 지표')}>
          <Text style={commonStyles.moreButton}>더보기</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {indicators.map((indicator, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.indicatorCard}
            onPress={() => handleIndicatorPress(indicator)}
          >
            <Text style={styles.indicatorTitle}>{indicator.title}</Text>
            <View style={styles.indicatorValueContainer}>
              <Text style={styles.indicatorValue}>{indicator.value}</Text>
              <View style={styles.indicatorChangeContainer}>
                <Text style={styles.iconText}>
                  {indicator.isPositive ? '📈' : '📉'}
                </Text>
                <Text 
                  style={[
                    styles.indicatorChange, 
                    { color: indicator.isPositive ? colors.success : colors.error }
                  ]}
                >
                  {indicator.change}
                </Text>
              </View>
            </View>
            <View style={styles.miniChart}>
              <RealTimeLineChart 
                data={indicator.data} 
                color={indicator.isPositive ? colors.success : colors.error} 
                showGrid={false}
                animated={false}
                height={60}
                showYAxisLabels={false}
                showXAxisLabels={false}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  indicatorCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginRight: spacing.lg,
    minWidth: 180,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorTitle: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  indicatorValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  indicatorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
    marginRight: spacing.sm,
  },
  indicatorChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iconText: {
    fontSize: 12,
  },
  indicatorChange: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  miniChart: {
    height: 80,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
