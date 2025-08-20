
// screens/PredictionScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../components/common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../styles/commonStyles';

export const PredictionScreen = ({ predictionData, onDetailedAnalysis, onAlarmSetting }) => {
  return (
    <View style={styles.container}>
      <View style={commonStyles.section}>
        <View style={commonStyles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>AI 가격 예측</Text>
            <TouchableOpacity onPress={() => Alert.alert('AI 분석', '머신러닝 기반 가격 예측 모델입니다.')}>
              <View style={styles.confidenceTag}>
                <Text style={styles.confidenceTagText}>신뢰도 87%</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <RealTimeLineChart 
            data={predictionData} 
            color={colors.secondary} 
            animated 
            height={250}
          />
          
          <View style={styles.predictionDetails}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>예상 저점</Text>
              <Text style={[styles.predictionValue, { color: colors.error }]}>₩27,800</Text>
              <Text style={styles.predictionDate}>7월 5일</Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>예상 고점</Text>
              <Text style={[styles.predictionValue, { color: colors.success }]}>₩29,650</Text>
              <Text style={styles.predictionDate}>7월 10일</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.card}>
          <Text style={styles.analysisTitle}>상세 분석</Text>
          <Text style={styles.analysisText}>
            현재 탄소배출권 시장은 여러 요인들의 영향을 받고 있습니다:
          </Text>
          <Text style={styles.bulletPoint}>• EU CBAM 본격 시행</Text>
          <Text style={styles.bulletPoint}>• 국내 할당량 조정</Text>
          <Text style={styles.bulletPoint}>• 글로벌 에너지 가격 변동</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.analysisButton} onPress={onDetailedAnalysis}>
              <Text style={styles.analysisButtonText}>상세 분석 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alarmButton} onPress={onAlarmSetting}>
              <Text style={styles.alarmButtonText}>알림 설정</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray800,
  },
  confidenceTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  predictionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  predictionItem: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  predictionLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  predictionDate: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  analysisText: {
    fontSize: 16,
    color: colors.gray600,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  analysisButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  analysisButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  alarmButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  alarmButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
