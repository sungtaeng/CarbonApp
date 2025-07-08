// screens/HomeScreen.js
import React from 'react';
import { ScrollView } from 'react-native';
import { CarbonPriceCard } from '../components/home/CarbonPriceCard';
import { KeyIndicators } from '../components/home/KeyIndicators';
import { AIPrediction } from '../components/home/AIPrediction';
import { LatestNews } from '../components/home/LatestNews';
import { EnergyPriceInfo } from '../components/home/EnergyPriceInfo';
import { InvestmentRecommendation } from '../components/home/InvestmentRecommendation';

export const HomeScreen = ({ 
  currentPrice, 
  priceChange, 
  isPositive, 
  realTimeData,
  keyIndicators,
  predictionData,
  newsItems,
  energyData,
  selectedPeriod,
  onPeriodChange,
  onDetailedAnalysis,
  onAlarmSetting,
  onNewsPress,
  onMorePress
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <CarbonPriceCard
        currentPrice={currentPrice}
        priceChange={priceChange}
        isPositive={isPositive}
        realTimeData={realTimeData}
      />

      <KeyIndicators
        indicators={keyIndicators}
        onMorePress={onMorePress}
      />

      <AIPrediction
        predictionData={predictionData}
        onDetailedAnalysis={onDetailedAnalysis}
        onAlarmSetting={onAlarmSetting}
      />

      <LatestNews
        newsItems={newsItems}
        onNewsPress={onNewsPress}
        onMorePress={onMorePress}
      />

      <EnergyPriceInfo
        energyData={energyData}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        onMorePress={onMorePress}
      />

      <InvestmentRecommendation
        onDetailedAnalysis={onDetailedAnalysis}
        onAlarmSetting={onAlarmSetting}
      />
    </ScrollView>
  );
};