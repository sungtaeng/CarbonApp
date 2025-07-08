// ========== 애니메이션 가격 컴포넌트 ==========
// components/common/AnimatedPrice.js
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/commonStyles';

export const AnimatedPrice = ({ price, change, isPositive }) => {
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
  }, [price, change]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.Text style={[
        styles.price,
        {
          color: colorAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [colors.error, colors.gray800, colors.success],
          }),
        }
      ]}>
        {price}
      </Animated.Text>
      <View style={styles.changeContainer}>
        <Text style={styles.icon}>
          {isPositive ? '▲' : '▼'}
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
          {change}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});