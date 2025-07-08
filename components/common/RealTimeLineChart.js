
// ========== 터치 인터랙션이 있는 차트 컴포넌트 ==========
// components/common/RealTimeLineChart.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { colors, spacing } from '../../styles/commonStyles';

const { width } = Dimensions.get('window');

export const RealTimeLineChart = ({ 
  data, 
  color = colors.primary, 
  showGrid = true, 
  animated = true,
  height = 140 
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [touchPosition, setTouchPosition] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (animated) {
      setAnimationProgress(0);
      const timer = setTimeout(() => {
        setAnimationProgress(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
    }
  }, [data, animated]);

  const chartWidth = width - 80;
  const chartHeight = height - 40;
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const padding = 20;

  // 좌표 계산
  const getCoordinates = (value, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
    const y = padding + (1 - (value - minValue) / range) * (chartHeight - 2 * padding);
    return { x, y };
  };

  // 터치 위치에서 가장 가까운 데이터 포인트 찾기
  const findNearestDataPoint = (touchX) => {
    const relativeX = touchX - padding;
    const dataPointWidth = (chartWidth - 2 * padding) / (data.length - 1);
    const index = Math.round(relativeX / dataPointWidth);
    return Math.max(0, Math.min(data.length - 1, index));
  };

  // 터치 이벤트 처리
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const index = findNearestDataPoint(touchX);
      const coords = getCoordinates(data[index], index);
      
      setTouchPosition({ x: coords.x, y: coords.y });
      setSelectedIndex(index);
      setShowTooltip(true);
    },
    
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const index = findNearestDataPoint(touchX);
      const coords = getCoordinates(data[index], index);
      
      setTouchPosition({ x: coords.x, y: coords.y });
      setSelectedIndex(index);
    },
    
    onPanResponderRelease: () => {
      // 터치를 놓아도 툴팁 유지 (3초 후 사라짐)
      setTimeout(() => {
        setShowTooltip(false);
        setTouchPosition(null);
        setSelectedIndex(null);
      }, 3000);
    },
  });

  // 선 그래프 Path 생성
  const createPath = () => {
    if (data.length === 0) return '';
    
    let path = '';
    data.forEach((value, index) => {
      const { x, y } = getCoordinates(value, index);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // 부드러운 곡선으로 연결
        const prevCoord = getCoordinates(data[index - 1], index - 1);
        const cp1x = prevCoord.x + (x - prevCoord.x) * 0.5;
        const cp1y = prevCoord.y;
        const cp2x = prevCoord.x + (x - prevCoord.x) * 0.5;
        const cp2y = y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    });
    
    return path;
  };

  // 면적 채우기용 Path 생성
  const createAreaPath = () => {
    if (data.length === 0) return '';
    
    const linePath = createPath();
    const firstPoint = getCoordinates(data[0], 0);
    const lastPoint = getCoordinates(data[data.length - 1], data.length - 1);
    
    return `${linePath} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${chartHeight - padding} Z`;
  };

  // 그리드 라인 생성
  const renderGridLines = () => {
    if (!showGrid) return null;
    
    const gridLines = [];
    const horizontalLines = 5;
    
    for (let i = 0; i <= horizontalLines; i++) {
      const y = padding + (i / horizontalLines) * (chartHeight - 2 * padding);
      gridLines.push(
        <Path
          key={`grid-${i}`}
          d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
          stroke={colors.gray200}
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }
    
    return gridLines;
  };

  // 데이터 포인트 렌더링
  const renderDataPoints = () => {
    return data.map((value, index) => {
      const { x, y } = getCoordinates(value, index);
      const isSelected = selectedIndex === index;
      
      return (
        <Circle
          key={`point-${index}`}
          cx={x}
          cy={y}
          r={isSelected ? "5" : "3"}
          fill={isSelected ? colors.white : color}
          stroke={color}
          strokeWidth={isSelected ? "3" : "2"}
          opacity={animationProgress}
        />
      );
    });
  };

  // 터치 인디케이터 렌더링
  const renderTouchIndicator = () => {
    if (!showTooltip || !touchPosition) return null;

    return (
      <>
        {/* 세로 선 */}
        <Line
          x1={touchPosition.x}
          y1={padding}
          x2={touchPosition.x}
          y2={chartHeight - padding}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.8"
        />
        
        {/* 가로 선 */}
        <Line
          x1={padding}
          y1={touchPosition.y}
          x2={chartWidth - padding}
          y2={touchPosition.y}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.8"
        />
        
        {/* 선택된 포인트 강조 */}
        <Circle
          cx={touchPosition.x}
          cy={touchPosition.y}
          r="6"
          fill={colors.white}
          stroke={color}
          strokeWidth="3"
        />
      </>
    );
  };

  const linePath = createPath();
  const areaPath = createAreaPath();
  const selectedValue = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={[styles.chartContainer, { height }]}>
      <View {...panResponder.panHandlers} style={styles.touchArea}>
        <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          
          {/* 그리드 */}
          {renderGridLines()}
          
          {/* 면적 채우기 */}
          <Path
            d={areaPath}
            fill="url(#areaGradient)"
            opacity={animationProgress}
          />
          
          {/* 선 그래프 */}
          <Path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={animationProgress}
          />
          
          {/* 데이터 포인트 */}
          {renderDataPoints()}
          
          {/* 터치 인디케이터 */}
          {renderTouchIndicator()}
        </Svg>
      </View>
      
      {/* 값 표시 */}
      <View style={styles.valueContainer}>
        <Text style={styles.maxValue}>{maxValue.toLocaleString()}</Text>
        <Text style={styles.minValue}>{minValue.toLocaleString()}</Text>
      </View>
      
      {/* 툴팁 */}
      {showTooltip && selectedValue !== null && (
        <View style={[
          styles.tooltip,
          {
            left: Math.max(10, Math.min(chartWidth - 80, touchPosition?.x - 40)),
            top: touchPosition?.y < 60 ? touchPosition?.y + 20 : touchPosition?.y - 60,
          }
        ]}>
          <Text style={styles.tooltipValue}>₩{selectedValue.toLocaleString()}</Text>
          
        </View>
      )}
      
  
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    marginVertical: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  touchArea: {
    flex: 1,
  },
  svg: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  valueContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    bottom: 15,
    justifyContent: 'space-between',
  },
  maxValue: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: '500',
  },
  minValue: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: '500',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.gray800,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  tooltipValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  tooltipIndex: {
    color: colors.gray200,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 10,
    color: colors.gray400,
    textAlign: 'center',
    opacity: 0.7,
  },
});
