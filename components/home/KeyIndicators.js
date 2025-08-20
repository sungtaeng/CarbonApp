// ========== 2. 주요 지표 ==========
// components/home/KeyIndicators.js
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';
import {
  fetchCoalPriceData,
  fetchNagPriceData,
  fetchWtiPriceData,
} from '../../firebaseConfig';

// ✅ kind/dates를 포함해 상세화면이 무엇을 눌렀는지 확실히 알 수 있게
function toCardData(kind, title, dates = [], values = [], currencyPrefix = '$') {
  if (!values || values.length === 0) {
    return { kind, title, dates: [], data: [], value: '-', change: '0%', isPositive: true };
  }
  const latest = Number(values.at(-1));
  const prev = Number(values.at(-2) ?? latest);
  const diffPct = prev !== 0 ? ((latest - prev) / prev) * 100 : 0;
  return {
    kind,
    title,
    dates,
    data: values,
    value: `${currencyPrefix}${latest.toFixed(2)}`,
    change: `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(2)}%`,
    isPositive: diffPct >= 0,
  };
}

export const KeyIndicators = ({ indicators, onMorePress, onDetailPress }) => {
  const [loading, setLoading] = useState(false);
  const [localIndicators, setLocalIndicators] = useState([]);

  const handleIndicatorPress = (indicator) => {
    Alert.alert(indicator.title, `현재 가격: ${indicator.value}\n변동률: ${indicator.change}`);
  };

  // 프롭이 없거나 빈 배열이면 Firebase에서 직접 로드
  useEffect(() => {
    const needsFetch = !Array.isArray(indicators) || indicators.length === 0;
    if (!needsFetch) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [coal, nag, wti] = await Promise.all([
          fetchCoalPriceData(), // {dates, values}
          fetchNagPriceData(),
          fetchWtiPriceData(),
        ]);

        if (!mounted) return;

        const cards = [
          toCardData('coal', '석탄 가격',  coal?.dates ?? [], coal?.values ?? [], '$'),
          toCardData('nag',  '천연가스',   nag?.dates  ?? [], nag?.values  ?? [], '$'),
          toCardData('wti',  '석유(WTI)',  wti?.dates  ?? [], wti?.values  ?? [], '$'),
        ];
        setLocalIndicators(cards);
      } catch (e) {
        setLocalIndicators([]); // 실패 시 빈 상태
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [indicators]);

  // 실제 렌더에 사용할 소스 선택 (프롭 우선, 없으면 로컬)
  const sourceIndicators =
    Array.isArray(indicators) && indicators.length > 0 ? indicators : localIndicators;

  return (
    <View style={commonStyles.section}>
      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>주요 지표</Text>
        {!!onMorePress && (
          <TouchableOpacity onPress={onMorePress}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>더보기</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {loading ? (
          <View style={{ paddingVertical: spacing.lg }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : Array.isArray(sourceIndicators) && sourceIndicators.length > 0 ? (
          sourceIndicators.map((indicator) => (
            // ✅ key를 index 대신 kind/title로 (안정적인 key)
            <View key={indicator.kind ?? indicator.title} style={styles.indicatorCard}>
              {/* 제목 */}
              <Text style={styles.indicatorTitle}>{indicator.title}</Text>

              {/* 상세보기 버튼 */}
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  if (onDetailPress) onDetailPress(indicator); // kind/dates/data 포함됨
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 12 }}>상세보기</Text>
              </TouchableOpacity>

              {/* 카드 터치 시 기존 Alert */}
              <TouchableOpacity onPress={() => handleIndicatorPress(indicator)}>
                <View style={styles.indicatorValueContainer}>
                  <Text style={styles.indicatorValue}>{indicator.value}</Text>
                  <View style={styles.indicatorChangeContainer}>
                    <Text style={styles.iconText}>{indicator.isPositive ? '📈' : '📉'}</Text>
                    <Text
                      style={[
                        styles.indicatorChange,
                        { color: indicator.isPositive ? colors.success : colors.error },
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
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>지표 데이터가 없습니다.</Text>
        )}
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
  detailButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
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
  iconText: { fontSize: 12 },
  indicatorChange: { fontSize: 12, fontWeight: '600', marginLeft: 2 },
  miniChart: {
    height: 80,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: { color: colors.gray400, fontSize: 14, paddingVertical: spacing.md },
});
