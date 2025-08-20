// ========== 시간대 선택기 ==========
// components/chart/TimeFrameSelector.js
import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const tfColors = { primary: '#10B981', gray100: '#F3F4F6', gray400: '#9CA3AF', gray600: '#6B7280', white: '#FFFFFF' };
const tfSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };

export const TimeFrameSelector = ({ selectedTimeframe, onTimeframeChange }) => {
  // 🟢 주/월/년만 노출
  const timeframes = [
    { key: '1주', label: '1주', category: 'week' },
    { key: '1개월', label: '1개월', category: 'month' },
    { key: '3개월', label: '3개월', category: 'month' },
    { key: '6개월', label: '6개월', category: 'month' },
    { key: '1년', label: '1년', category: 'year' },
    { key: '3년', label: '3년', category: 'year' },
    { key: '5년', label: '5년', category: 'year' },
  ];

  const categories = {
    week: { label: '주봉', color: '#3B82F6' },
    month: { label: '월봉', color: '#8B5CF6' },
    year: { label: '년봉', color: '#EC4899' },
  };

  const groupedTimeframes = useMemo(() => {
    return timeframes.reduce((acc, tf) => {
      if (!acc[tf.category]) acc[tf.category] = [];
      acc[tf.category].push(tf);
      return acc;
    }, {});
  }, [timeframes]);

  // 선택값이 목록에 없으면 첫 번째로 보정
  useEffect(() => {
    const keys = timeframes.map((t) => t.key);
    if (!keys.includes(selectedTimeframe) && keys.length > 0) {
      onTimeframeChange(keys[0]);
    }
  }, [timeframes, selectedTimeframe, onTimeframeChange]);

  return (
    <View style={tfStyles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tfStyles.timeframeContainer}>
          {Object.entries(groupedTimeframes).map(([category, items]) => (
            <View key={category} style={tfStyles.categoryGroup}>
              <View style={tfStyles.categoryHeader}>
                <View style={[tfStyles.categoryDot, { backgroundColor: categories[category].color }]} />
                <Text style={tfStyles.categoryLabel}>{categories[category].label}</Text>
              </View>
              <View style={tfStyles.timeframeButtons}>
                {items.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.key}
                    style={[tfStyles.timeframeButton, selectedTimeframe === timeframe.key && tfStyles.selectedTimeframeButton, { borderColor: categories[category].color }]}
                    onPress={() => onTimeframeChange(timeframe.key)}
                  >
                    <Text style={[tfStyles.timeframeButtonText, selectedTimeframe === timeframe.key && { color: categories[category].color, fontWeight: '700' }]}>
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const tfStyles = StyleSheet.create({
  container: { backgroundColor: tfColors.white, paddingVertical: tfSpacing.md, borderBottomWidth: 1, borderBottomColor: tfColors.gray100 },
  timeframeContainer: { flexDirection: 'row', paddingHorizontal: tfSpacing.lg, gap: tfSpacing.xl },
  categoryGroup: { alignItems: 'center' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: tfSpacing.sm },
  categoryDot: { width: 6, height: 6, borderRadius: 3, marginRight: tfSpacing.xs },
  categoryLabel: { fontSize: 11, color: tfColors.gray600, fontWeight: '600' },
  timeframeButtons: { flexDirection: 'row', gap: tfSpacing.xs },
  timeframeButton: { paddingHorizontal: tfSpacing.sm, paddingVertical: tfSpacing.xs, borderRadius: 6, borderWidth: 1, borderColor: tfColors.gray100, backgroundColor: tfColors.white },
  selectedTimeframeButton: { backgroundColor: tfColors.gray100 },
  timeframeButtonText: { fontSize: 12, color: tfColors.gray600, fontWeight: '500' },
});
