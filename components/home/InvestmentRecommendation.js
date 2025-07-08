// ========== 6. 오늘의 투자 제안 ==========
// components/home/InvestmentRecommendation.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const InvestmentRecommendation = ({ onDetailedAnalysis, onAlarmSetting }) => {
  const handleRecommendationPress = () => {
    Alert.alert(
      '투자 제안 상세',
      '현재 시장 분석:\n\n• 탄소배출권 가격 상승 추세\n• EU CBAM 시행 영향\n• 국내 정책 변화\n\nAI 분석 결과 3일 내 매수 기회 예상',
      [
        { text: '닫기', style: 'cancel' },
        { text: '알림 설정', onPress: onAlarmSetting },
        { text: '상세 분석', onPress: onDetailedAnalysis }
      ]
    );
  };

  return (
    <View style={commonStyles.section}>
      <TouchableOpacity 
        style={styles.recommendationCard}
        onPress={handleRecommendationPress}
      >
        <View style={styles.recommendationContent}>
          <View style={styles.recommendationIcon}>
            <Text style={styles.recommendationIconText}>💡</Text>
          </View>
          <View style={styles.recommendationText}>
            <Text style={styles.recommendationTitle}>오늘의 투자 제안</Text>
            <Text style={styles.recommendationDescription}>
              현재 탄소배출권 가격은 상승 추세에 있으며, AI 분석 결과 향후 3일 내 매수 기회가 있을 것으로 예상됩니다.
            </Text>
            <View style={styles.recommendationButtons}>
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={onDetailedAnalysis}
              >
                <Text style={styles.detailButtonText}>자세히 보기</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton} 
                onPress={onAlarmSetting}
              >
                <Text style={styles.notificationButtonText}>알림 설정</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  recommendationContent: {
    flexDirection: 'row',
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  recommendationIconText: {
    fontSize: 24,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  recommendationButtons: {
    flexDirection: 'row',
  },
  detailButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  detailButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  notificationButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});