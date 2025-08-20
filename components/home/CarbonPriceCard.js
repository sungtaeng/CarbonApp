// components/home/CarbonPriceCard.js
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const CarbonPriceCard = ({ 
  currentPrice, 
  priceChange, 
  isPositive, 
  realTimeData,
  onDetailPress // 🔹 상세보기 버튼 콜백
}) => {
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
  }, [currentPrice, priceChange, isPositive]);

  return (
    <View style={[commonStyles.section]}>
      <View style={commonStyles.card}>
        {/* 헤더 */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>한국 탄소배출권 (KAU)</Text>
          
          {/* 상세보기 버튼 */}
          <TouchableOpacity onPress={onDetailPress}>
            <Text style={styles.detailButton}>상세보기</Text>
          </TouchableOpacity>
        </View>

        {/* 가격 표시 */}
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
            ₩{Number(currentPrice || 0).toLocaleString()}
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
              {Number(priceChange || 0)}%
            </Animated.Text>
          </View>
        </Animated.View>

        {/* 미니 라인 차트 */}
        <RealTimeLineChart data={Array.isArray(realTimeData) ? realTimeData : []} color={colors.primary} animated />

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
  detailButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
