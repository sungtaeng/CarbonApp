// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { CarbonPriceCard } from '../components/home/CarbonPriceCard';
import { EnergyPriceInfo } from '../components/home/EnergyPriceInfo';
import { LatestNews } from '../components/home/LatestNews';
import { KeyIndicators } from '../components/home/KeyIndicators';
import { ChartDetailView } from '../components/chart/ChartDetailView';
import { fetchNewsFromFirebase, fetchEtsPriceData } from '../firebaseConfig';
import { colors, spacing, commonStyles } from '../styles/commonStyles';

export const HomeScreen = ({
  currentPrice: propCurrentPrice,
  priceChange: propPriceChange,
  isPositive: propIsPositive,
  realTimeData: propRealTimeData,
  energyData,
  selectedPeriod,
  onPeriodChange,
  onDetailPress: _ignoredFromParent, // 내부에서 구현
  showDetailChart,
  selectedChart,
  onBackPress,
}) => {
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // ✅ ETS 시계열 (fallback 용)
  const [etsDates, setEtsDates] = useState([]);
  const [etsValues, setEtsValues] = useState([]);
  const [etsCurrent, setEtsCurrent] = useState(0);
  const [etsChange, setEtsChange] = useState(0);
  const [etsPositive, setEtsPositive] = useState(true);
  const [etsMiniSeries, setEtsMiniSeries] = useState([]);

  // Firebase에서 뉴스 데이터 가져오기 (홈화면용 - 최대 5개)
  const loadHomeNews = async () => {
    try {
      setNewsLoading(true);
      const firebaseNews = await fetchNewsFromFirebase();
      const homeNews = firebaseNews.slice(0, 5);
      setNewsItems(homeNews);
    } catch (error) {
      console.error('❌ HomeScreen 뉴스 로딩 실패:', error);
      setNewsItems([]);
    } finally {
      setNewsLoading(false);
    }
  };

  // ETS 데이터 로드 (props 없을 때만 의미)
  const loadEts = async () => {
    try {
      const { dates, values } = await fetchEtsPriceData();
      setEtsDates(dates);
      setEtsValues(values);

      const n = values.length;
      const latest = n ? values[n - 1] : 0;
      const prev   = n > 1 ? values[n - 2] : latest;
      const pct    = prev ? Number((((latest - prev) / prev) * 100).toFixed(2)) : 0;

      setEtsCurrent(latest);
      setEtsChange(pct);
      setEtsPositive(pct >= 0);
      setEtsMiniSeries(values.slice(-60));
    } catch (e) {
      console.log('ETS load failed:', e);
      setEtsDates([]); setEtsValues([]);
      setEtsCurrent(0); setEtsChange(0); setEtsPositive(true); setEtsMiniSeries([]);
    }
  };

  // 뉴스 로드
  useEffect(() => { loadHomeNews(); }, []);

  // ETS 로드 (props가 없을 경우 대비)
  const propsProvided = typeof propCurrentPrice === 'number' && Array.isArray(propRealTimeData);
  useEffect(() => {
    if (!propsProvided) loadEts();
  }, [propsProvided]);

  // 상세보기 클릭: 전체 시계열을 들고 ChartDetailView로
  const handleDetailPress = () => {
    const dates = propsProvided ? selectedChart?.dates ?? etsDates : etsDates;
    const values = propsProvided ? selectedChart?.data ?? etsValues : etsValues;

    const payload = {
      title: '한국 탄소배출권 (KAU)',
      kind: 'ets',
      dates: propsProvided ? (selectedChart?.dates || dates) : dates,
      data: propsProvided ? (selectedChart?.data || values) : values,
      predictedData: [], // 추후 예측 연결
      volumeData: [],    // 추후 거래량 연결
      value: `₩${Number((propsProvided ? propCurrentPrice : etsCurrent) || 0).toLocaleString()}`,
      change: `${Number((propsProvided ? propPriceChange : etsChange) || 0)}%`,
      isPositive: propsProvided ? !!propIsPositive : etsPositive,
    };

    // 상위(App)에서 showDetailChart/selectedChart 제어 중이면 onDetailPress를 상위에서 내려줬을 텐데,
    // 여기서는 상위가 없다는 가정하에 navigation 상태를 외부(App)에서 처리한다고 가정합니다.
    // 만약 HomeScreen에서 직접 상태를 관리한다면 여기서 setShowDetailChart/setSelectedChart를 호출하면 됩니다.
    // -> 기존 구조 유지 위해 이벤트만 발생시킨다고 가정:
    if (typeof _ignoredFromParent === 'function') {
      _ignoredFromParent(payload);
    } else {
      // HomeScreen이 직접 상세뷰를 띄우는 구조인 경우를 대비해,
      // 부모(App)에서 showDetailChart/selectedChart를 이 props로 넘겨주고 있을 것입니다.
      // 이 파일 단독으로는 상태 제어가 없으니, App 쪽 로직과 맞춰 쓰세요.
      console.warn('onDetailPress prop이 없어 상세보기 호출만 수행했습니다. App에서 상태를 제어하세요.');
    }
  };

  // 차트 디테일 뷰가 열려있으면 그것을 보여줌
  if (showDetailChart && selectedChart) {
    return (
      <ChartDetailView
        indicator={selectedChart}
        actualData={selectedChart.data}
        predictedData={selectedChart.predictedData || []}
        volumeData={selectedChart.volumeData || []}
        onBackPress={onBackPress}
      />
    );
  }

  const displayCurrentPrice = propsProvided ? propCurrentPrice : etsCurrent;
  const displayPriceChange  = propsProvided ? propPriceChange  : etsChange;
  const displayIsPositive   = propsProvided ? propIsPositive   : etsPositive;
  const displayMiniSeries   = propsProvided ? propRealTimeData : etsMiniSeries;

  return (
    <ScrollView style={styles.container}>
      <CarbonPriceCard
        currentPrice={displayCurrentPrice}
        priceChange={displayPriceChange}
        isPositive={displayIsPositive}
        realTimeData={displayMiniSeries}
        onDetailPress={handleDetailPress}
      />

      <EnergyPriceInfo
        energyData={energyData}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
      />

      {/* ✅ 프롭 없이 사용하면 KeyIndicators가 자체적으로 Firebase에서 석탄/천연가스/WTI 로드 */}
      <KeyIndicators onDetailPress={_ignoredFromParent} />

      <View style={commonStyles.section}>
        <View style={styles.newsHeader}>
          <Text style={styles.sectionTitle}>최신 뉴스</Text>
          {newsItems.length > 0 && (
            <Text style={styles.newsCount}>
              {newsLoading ? '로딩 중...' : `${newsItems.length}개`}
            </Text>
          )}
        </View>

        <LatestNews
          newsItems={newsItems}
          onNewsPress={(news) => {
            const url = news.url;
            if (url && url !== '#') {
              const finalUrl = url.startsWith('http') ? url : `https://${url}`;
              Linking.canOpenURL(finalUrl)
                .then((supported) => {
                  if (supported) Linking.openURL(finalUrl);
                  else Alert.alert('오류', 'URL을 열 수 없습니다.');
                })
                .catch(() => Alert.alert('오류', '링크를 열 수 없습니다.'));
            } else {
              Alert.alert('알림', '링크가 제공되지 않은 뉴스입니다.');
            }
          }}
          newsLoading={newsLoading}
        />

        {/* 더 많은 뉴스 보기 힌트 */}
        {newsItems.length > 0 && !newsLoading && (
          <View style={styles.moreNewsHint}>
            <Text style={styles.hintText}>📰 더 많은 뉴스는 뉴스 탭에서 확인하세요</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray800 },
  newsCount: {
    fontSize: 12,
    color: colors.gray500,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreNewsHint: { marginTop: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  hintText: { fontSize: 12, color: colors.gray500, textAlign: 'center', fontStyle: 'italic' },
});
