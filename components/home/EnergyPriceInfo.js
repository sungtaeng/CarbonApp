// ========== 5. 에너지 가격 정보 ==========
// components/home/EnergyPriceInfo.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const EnergyPriceInfo = ({ energyData, selectedPeriod, onPeriodChange, onMorePress }) => {
  const energyPrices = [
    { 
      title: 'SMP (원/kWh)', 
      value: '134.25', 
      change: '+2.1%', 
      isPositive: true,
      description: '계통한계가격'
    },
    { 
      title: 'REC (원/REC)', 
      value: '32,450', 
      change: '-0.8%', 
      isPositive: false,
      description: '신재생에너지인증서'
    },
    { 
      title: '석탄 ($/톤)', 
      value: '145.20', 
      change: '-1.2%', 
      isPositive: false,
      description: '뉴캐슬 석탄 선물'
    },
    { 
      title: '천연가스 ($/MMBtu)', 
      value: '3.85', 
      change: '+0.8%', 
      isPositive: true,
      description: 'Henry Hub 천연가스'
    },
  ];

  return (
    <View style={commonStyles.section}>
      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>에너지 가격 정보</Text>
      </View>
      <View style={commonStyles.card}>
        <View style={styles.periodSelector}>
          {['일간', '주간', '월간', '연간'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton
              ]}
              onPress={() => onPeriodChange(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.selectedPeriodButtonText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <RealTimeLineChart 
          data={energyData} 
          color={colors.primary} 
          animated 
          height={140}
          showXAxisLabels={false}
        />
        
        <View style={styles.energyPricesGrid}>
          {energyPrices.map((price, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.energyPriceItem}
              onPress={() => Alert.alert(price.title, price.description)}
            >
              <Text style={styles.energyPriceTitle}>{price.title}</Text>
              <Text style={styles.energyPriceValue}>{price.value}</Text>
              <View style={styles.energyPriceChangeContainer}>
                <Text style={styles.iconText}>
                  {price.isPositive ? '📈' : '📉'}
                </Text>
                <Text 
                  style={[
                    styles.energyPriceChange, 
                    { color: price.isPositive ? colors.success : colors.error }
                  ]}
                >
                  {price.change}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  energyPricesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  energyPriceItem: {
    width: '48%',
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  energyPriceTitle: {
    fontSize: 12,
    color: colors.gray400,
    marginBottom: 6,
    fontWeight: '500',
  },
  energyPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: 4,
  },
  energyPriceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
  },
  energyPriceChange: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
