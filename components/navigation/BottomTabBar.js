// ========== 네비게이션 바 ==========
// components/navigation/BottomTabBar.js
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/commonStyles';

export const BottomTabBar = ({ activeTab, onTabPress }) => {
  const panAnim = useRef(new Animated.Value(0)).current;
  
  const tabs = [
    { icon: '🏠', label: '홈' },
    { icon: '📈', label: '차트' },
    { icon: '📰', label: '뉴스' },
    { icon: '🔮', label: '예측' }
  ];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: Animated.event([null, { dx: panAnim }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50 && activeTab > 0) {
        onTabPress(activeTab - 1);
      } else if (gestureState.dx < -50 && activeTab < tabs.length - 1) {
        onTabPress(activeTab + 1);
      }
      
      Animated.spring(panAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <Animated.View 
      style={[
        styles.tabBar,
        { transform: [{ translateX: panAnim }] }
      ]}
      {...panResponder.panHandlers}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tabItem,
            activeTab === index && styles.activeTabItem,
          ]}
          onPress={() => onTabPress(index)}
          activeOpacity={0.7}
        >
          <Animated.Text style={[
            styles.tabIcon,
            {
              opacity: activeTab === index ? 1 : 0.6,
              transform: [{
                scale: activeTab === index ? 1.2 : 1,
              }],
            }
          ]}>
            {tab.icon}
          </Animated.Text>
          <Text style={[
            styles.tabLabel,
            { color: activeTab === index ? colors.primary : colors.gray600 }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 16,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTabItem: {
    backgroundColor: '#F0FDF4',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});