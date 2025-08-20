// App.js
import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ✅ 핀치 제스처용 추가
import { HomeScreen } from './screens/HomeScreen';
import { NewsScreen } from './screens/NewsScreen';
import { PredictionScreen } from './screens/PredictionScreen';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { colors, commonStyles } from './styles/commonStyles';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('일간');
  const [showDetailChart, setShowDetailChart] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  const [currentPrice] = useState(28450);
  const [priceChange] = useState(2.4);
  const [isPositive] = useState(true);
  const [predictionData] = useState([28450, 28300, 28100, 27800, 28200, 28600, 29100, 29400, 29650]);
  const [energyData] = useState([130.5, 131.2, 132.4, 133.1, 132.8, 133.5, 134.25]);

  const handleDetailPress = (chartData) => {
    setSelectedChart(chartData);
    setShowDetailChart(true);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        return (
          <HomeScreen
            currentPrice={currentPrice}
            priceChange={priceChange}
            isPositive={isPositive}
        
            predictionData={predictionData}
            energyData={energyData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            onDetailPress={handleDetailPress}
            showDetailChart={showDetailChart}
            selectedChart={selectedChart}
            onBackPress={() => setShowDetailChart(false)}
          />
        );
      case 1:
        return <NewsScreen />;
      case 2:
        return <PredictionScreen predictionData={predictionData} />;
      default:
        return null;
    }
  };

  return (
    // ✅ 핀치 제스처 지원을 위한 GestureHandlerRootView로 감싸기
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={commonStyles.container}>
        <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
        {renderScreen()}
        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;
