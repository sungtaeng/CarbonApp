// components/chart/ChartDetailView.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimeFrameSelector } from './TimeFrameSelector';
import { RealTimeLineChart } from '../common/RealTimeLineChart';
import { colors, spacing } from '../../styles/commonStyles';
import { buildCloseSeriesFromDates } from '../../utils/seriesFromDates';
import { fetchCoalPriceData, fetchNagPriceData, fetchWtiPriceData, fetchEtsPriceData } from '../../firebaseConfig';

const { height: screenHeight } = Dimensions.get('window');

// indicator.kind가 없을 수도 있으니 title로도 유추
const detectKind = (indicator) => {
  const k = indicator?.kind;
  if (k === 'coal' || k === 'nag' || k === 'wti' || k === 'ets') return k;
  const title = indicator?.title ?? '';
  if (title.includes('KAU') || title.includes('탄소배출권') || title.includes('ETS')) return 'ets';
  if (title.includes('석탄')) return 'coal';
  if (title.includes('천연가스')) return 'nag';
  if (title.includes('WTI') || title.includes('석유')) return 'wti';
  return 'coal'; // 최후의 fallback
};

export const ChartDetailView = ({ indicator, onBackPress }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1주'); // 기본: 주봉
  const [chartInteracting, setChartInteracting] = useState(false);

  // ✅ 선택된 지표의 시계열 상태
  const [seriesDates, setSeriesDates] = useState([]);
  const [seriesValues, setSeriesValues] = useState([]);

  const kind = detectKind(indicator);

  // 1) 프롭에 데이터가 있으면 그걸 우선 사용
  // 2) 없으면 kind에 맞춰 Firebase에서 로드
  useEffect(() => {
    let mounted = true;

    const usePropsIfAvailable = () => {
      const hasPropValues = Array.isArray(indicator?.data) && indicator.data.length > 0;
      const hasPropDates = Array.isArray(indicator?.dates) && indicator.dates.length > 0;

      if (hasPropValues) setSeriesValues(indicator.data);
      if (hasPropDates) setSeriesDates(indicator.dates);

      return hasPropValues || hasPropDates;
    };

    (async () => {
      if (usePropsIfAvailable()) return;

      try {
        let res = { dates: [], values: [] };
        if (kind === 'coal') res = await fetchCoalPriceData();
        else if (kind === 'nag') res = await fetchNagPriceData();
        else if (kind === 'wti') res = await fetchWtiPriceData();
        else if (kind === 'ets') res = await fetchEtsPriceData();

        if (!mounted) return;
        setSeriesDates(res?.dates ?? []);
        setSeriesValues(res?.values ?? []);
      } catch {
        if (!mounted) return;
        setSeriesDates([]);
        setSeriesValues([]);
      }
    })();

    return () => { mounted = false; };
  }, [indicator, kind]);

  // 통화 심볼
  const currencySymbol = (() => {
    if (kind === 'ets' || indicator?.title?.includes('탄소배출권') || indicator?.title?.includes('KAU')) return '₩';
    if (indicator?.title?.includes('EU ETS')) return '€';
    if (kind === 'wti' || kind === 'coal' || kind === 'nag' || indicator?.title?.includes('석탄') || indicator?.title?.includes('천연가스')) return '$';
    return '$';
  })();

  // 전체 집계(주/월/년)
  const fullSeries = useMemo(() => {
    if (!seriesDates.length || !seriesValues.length) return { dates: [], values: [] };
    return buildCloseSeriesFromDates(seriesDates, seriesValues, selectedTimeframe);
  }, [seriesDates, seriesValues, selectedTimeframe]);

  // 초기 “살짝만 보이게”
  const initialBars = useMemo(() => {
    const len = fullSeries.values.length || 2;
    if (selectedTimeframe.includes('주')) return Math.min(8, len);     // 최근 ~8주
    if (selectedTimeframe.includes('개월')) return Math.min(6, len);   // 최근 ~6개월
    return Math.min(3, len);                                           // 최근 ~3년
  }, [fullSeries, selectedTimeframe]);

  // 통계(집계 범위)
  const maxValue = useMemo(() => fullSeries.values.length ? Math.max(...fullSeries.values) : NaN, [fullSeries]);
  const minValue = useMemo(() => fullSeries.values.length ? Math.min(...fullSeries.values) : NaN, [fullSeries]);
  const avgValue = useMemo(() => {
    const arr = fullSeries.values; if (!arr.length) return NaN;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }, [fullSeries]);

  const chartColor =
    indicator?.isPositive === false ? colors.error :
    (indicator?.isPositive ? colors.success : colors.primary);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} scrollEnabled={!chartInteracting}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBackPress}>
              <Text style={styles.backButton}>← 뒤로가기</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {indicator ? indicator.title : '차트'} 상세보기
            </Text>
          </View>

          {/* 현재가/변동 */}
          {indicator && (
            <View style={styles.priceInfoContainer}>
              <View style={styles.priceInfo}>
                <Text style={styles.currentValue}>{indicator.value}</Text>
                <View style={[
                  styles.changeContainer,
                  { backgroundColor: (indicator.isPositive ? colors.success : colors.error) + '20' }
                ]}>
                  <Text style={styles.changeIcon}>{indicator.isPositive ? '📈' : '📉'}</Text>
                  <Text style={[
                    styles.changeText,
                    { color: indicator.isPositive ? colors.success : colors.error }
                  ]}>
                    {indicator.change}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 타임프레임 선택(주/월/년) */}
          <TimeFrameSelector selectedTimeframe={selectedTimeframe} onTimeframeChange={setSelectedTimeframe} />

          {/* 메인 차트 */}
          <View style={styles.chartContainer}>
            <RealTimeLineChart
              key={`chart-${kind}-${selectedTimeframe}-${fullSeries.values.length}`} // ✅ 지표/타임프레임 바뀌면 초기화
              data={fullSeries.values}
              labels={fullSeries.dates}
              valuePrefix={currencySymbol}
              color={chartColor}
              height={screenHeight * 0.4}
              initialBarsOnScreen={initialBars}
              onGestureToggle={setChartInteracting}
            />
          </View>

          {/* 통계(전체 집계 기준) */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>최대값(집계)</Text>
                <Text style={styles.statValue}>{Number.isFinite(maxValue) ? `${currencySymbol}${maxValue.toLocaleString()}` : '-'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>최소값(집계)</Text>
                <Text style={styles.statValue}>{Number.isFinite(minValue) ? `${currencySymbol}${minValue.toLocaleString()}` : '-'}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>평균(집계)</Text>
                <Text style={styles.statValue}>{Number.isFinite(avgValue) ? `${currencySymbol}${avgValue.toFixed(2).toLocaleString()}` : '-'}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>데이터 포인트(집계)</Text>
                <Text style={styles.statValue}>{fullSeries.values.length}개</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  backButton: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: spacing.md, color: colors.gray800, flex: 1 },
  priceInfoContainer: { backgroundColor: colors.white, marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: 12, padding: spacing.lg, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  priceInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  currentValue: { fontSize: 24, fontWeight: 'bold', color: colors.gray800 },
  changeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  changeIcon: { fontSize: 14, marginRight: 4 },
  changeText: { fontSize: 16, fontWeight: '600' },
  chartContainer: { backgroundColor: colors.white, marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: 12, padding: spacing.sm, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsContainer: { backgroundColor: colors.white, marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: 12, padding: spacing.lg, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.gray500, marginBottom: spacing.xs },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.gray800 },
});
