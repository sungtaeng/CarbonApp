// App.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, Alert, Linking } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { ChartScreen } from './screens/ChartScreen';
import { NewsScreen } from './screens/NewsScreen';
import { PredictionScreen } from './screens/PredictionScreen';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { colors, commonStyles } from './styles/commonStyles';

function App() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('일간');
  const [currentPrice, setCurrentPrice] = useState(28450);
  const [priceChange, setPriceChange] = useState(2.4);
  const [isPositive, setIsPositive] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // 데이터
  const [realTimeData, setRealTimeData] = useState([28100, 28250, 28300, 28150, 28400, 28350, 28450]);
  const [predictionData] = useState([28450, 28300, 28100, 27800, 28200, 28600, 29100, 29400, 29650]);
  const [energyData, setEnergyData] = useState([130.5, 131.2, 132.4, 133.1, 132.8, 133.5, 134.25]);

  const keyIndicators = [
    { 
      title: '석탄 가격', 
      value: '$145.20', 
      change: '-1.2%', 
      isPositive: false,
      data: [148, 147, 146.5, 146, 145.5, 145.2],
    },
    { 
      title: '천연가스', 
      value: '$3.85', 
      change: '+0.8%', 
      isPositive: true,
      data: [3.75, 3.78, 3.8, 3.82, 3.84, 3.85],
    },
    { 
      title: 'EU ETS', 
      value: '€82.30', 
      change: '+1.5%', 
      isPositive: true,
      data: [80.5, 81.2, 81.5, 81.8, 82.1, 82.3],
    },
  ];

  const newsItems = [
    {
      id: 1,
      category: '정책',
      categoryColor: colors.primary,
      time: '2시간 전',
      title: '환경부, 2025년 탄소배출권 할당계획 발표...기업 부담 완화 방안 포함',
      image: 'https://picsum.photos/400/200?random=1',
      summary: '환경부가 2025년 탄소배출권 할당계획을 발표했습니다.',
      url: 'https://example.com/news1',
    },
    {
      id: 2,
      category: '시장',
      categoryColor: colors.secondary,
      time: '5시간 전',
      title: 'EU 탄소국경조정제도(CBAM) 본격 시행, 국내 철강·화학 업계 대응 분주',
      image: 'https://picsum.photos/400/200?random=2',
      summary: 'EU CBAM 시행으로 국내 기업들이 대응책 마련에 분주합니다.',
      url: 'https://example.com/news2',
    },
    {
      id: 3,
      category: '분석',
      categoryColor: colors.warning,
      time: '오늘',
      title: '2분기 탄소배출권 가격 상승세 지속...전문가 "하반기 30,000원 돌파 전망"',
      image: 'https://picsum.photos/400/200?random=3',
      summary: '전문가들이 하반기 탄소배출권 가격 30,000원 돌파를 전망했습니다.',
      url: 'https://example.com/news3',
    },
  ];

  // 실시간 업데이트 효과
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 100;
      const newPrice = Math.round(currentPrice + randomChange);
      const change = ((newPrice - currentPrice) / currentPrice * 100).toFixed(1);
      
      setCurrentPrice(newPrice);
      setPriceChange(Math.abs(change));
      setIsPositive(change >= 0);
      setRealTimeData(prev => [...prev.slice(1), newPrice]);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // 핸들러 함수들
  const handleDetailedAnalysis = async () => {
    try {
      const url = 'https://readdy.ai/home/a6d4e9d3-eff6-43dd-848c-0a77a432a561/f43f4c0f-06f8-4607-b8c3-d735b3b55c1f';
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '링크 열기에 실패했습니다.');
    }
  };

  const handleAlarmSetting = () => {
    Alert.alert('알림 설정', '가격 알림이 설정되었습니다.');
  };

  const handleNotificationToggle = (value) => {
    setNotifications(value);
    Alert.alert('알림 설정', value ? '알림이 활성화되었습니다.' : '알림이 비활성화되었습니다.');
  };

  const handleNewsPress = (news) => {
    Alert.alert(news.category, news.summary);
  };

  const handleMorePress = (section) => {
    Alert.alert(`${section} 더보기`, '상세 정보를 확인하시겠습니까?');
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const periodData = {
      '일간': [130.5, 131.2, 132.4, 133.1, 132.8, 133.5, 134.25],
      '주간': [128, 129.5, 131, 132.5, 133, 133.8, 134.25],
      '월간': [125, 127, 129, 131, 132, 133, 134.25],
      '연간': [120, 122, 125, 128, 130, 132, 134.25],
    };
    setEnergyData(periodData[period]);
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
  };

  // 화면 렌더링
  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        return (
          <HomeScreen
            currentPrice={currentPrice}
            priceChange={priceChange}
            isPositive={isPositive}
            realTimeData={realTimeData}
            keyIndicators={keyIndicators}
            predictionData={predictionData}
            newsItems={newsItems}
            energyData={energyData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            onDetailedAnalysis={handleDetailedAnalysis}
            onAlarmSetting={handleAlarmSetting}
            onNewsPress={handleNewsPress}
            onMorePress={handleMorePress}
          />
        );
      case 1:
        return (
          <ChartScreen
            realTimeData={realTimeData}
            predictionData={predictionData}
          />
        );
      case 2:
        return (
          <NewsScreen
            newsItems={newsItems}
            onNewsPress={handleNewsPress}
          />
        );
      case 3:
        return (
          <PredictionScreen
            predictionData={predictionData}
            onDetailedAnalysis={handleDetailedAnalysis}
            onAlarmSetting={handleAlarmSetting}
          />
        );
    
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      
      {renderScreen()}

      <BottomTabBar 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
      />
    </SafeAreaView>
  );
}

export default App;
