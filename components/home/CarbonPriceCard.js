// ========== 1. 탄소배출권 가격 카드 ==========
// components/home/CarbonPriceCard.js
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const CarbonPriceCard = ({ currentPrice, priceChange, isPositive, realTimeData }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(colorAnim, {
      toValue: isPositive ? 1 : -1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentPrice, priceChange]);

  return (
    <View style={[commonStyles.section]}>
      <View style={commonStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>한국 탄소배출권 (KAU)</Text>
          <View style={[styles.liveTag, { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.liveTagText, { color: isPositive ? '#065F46' : '#991B1B' }]}>
              실시간
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.priceContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={[
            styles.price,
            {
              color: colorAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [colors.error, colors.gray800, colors.success],
              }),
            }
          ]}>
            ₩{currentPrice.toLocaleString()}
          </Animated.Text>
          <View style={styles.changeContainer}>
            <Text style={styles.iconText}>
              {isPositive ? '📈' : '📉'}
            </Text>
            <Animated.Text style={[
              styles.changeText,
              {
                color: colorAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [colors.error, colors.gray600, colors.success],
                }),
              }
            ]}>
              {priceChange}%
            </Animated.Text>
          </View>
        </Animated.View>

        <RealTimeLineChart data={realTimeData} color={colors.primary} animated />

        <View style={styles.timeLabels}>
          <Text style={styles.timeLabel}>09:00</Text>
          <Text style={styles.timeLabel}>12:00</Text>
          <Text style={styles.timeLabel}>15:00</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray800,
  },
  liveTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: spacing.lg,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  iconText: {
    fontSize: 18,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
  },
});