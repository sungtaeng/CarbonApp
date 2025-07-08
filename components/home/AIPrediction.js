// components/home/AIPrediction.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const AIPrediction = ({ predictionData, onDetailedAnalysis, onAlarmSetting }) => {
  return (
    <View style={commonStyles.section}>
      <View style={commonStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>AI 가격 예측</Text>
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
        />
        
        <View style={styles.predictionSummary}>
          <TouchableOpacity 
            style={styles.predictionItem}
            onPress={() => Alert.alert('예상 저점', '7월 5일에 ₩27,800 예상')}
          >
            <Text style={styles.predictionLabel}>예상 저점</Text>
            <Text style={[styles.predictionValue, { color: colors.error }]}>₩27,800</Text>
            <Text style={styles.predictionDate}>7월 5일</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.predictionItem}
            onPress={() => Alert.alert('예상 고점', '7월 10일에 ₩29,650 예상')}
          >
            <Text style={styles.predictionLabel}>예상 고점</Text>
            <Text style={[styles.predictionValue, { color: colors.success }]}>₩29,650</Text>
            <Text style={styles.predictionDate}>7월 10일</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.analysisButton} onPress={onDetailedAnalysis}>
            <Text style={styles.iconText}>📊</Text>
            <Text style={styles.analysisButtonText}>상세 분석</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alarmButton} onPress={onAlarmSetting}>
            <Text style={styles.iconText}>⏰</Text>
            <Text style={styles.alarmButtonText}>알림 설정</Text>
          </TouchableOpacity>
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
  predictionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  predictionItem: {
    alignItems: 'center',
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  predictionLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analysisButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  analysisButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  alarmButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  alarmButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  iconText: {
    fontSize: 18,
  },
});