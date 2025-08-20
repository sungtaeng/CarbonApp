// components/common/RealTimeLineChart.js
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { PinchGestureHandler, PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { colors, spacing } from '../../styles/commonStyles';

const { width } = Dimensions.get('window');

export const RealTimeLineChart = ({
  data = [],
  labels = [],
  valuePrefix = '',
  color = colors.primary,
  showGrid = true,
  height = 140,
  initialBarsOnScreen = 8,
  onGestureToggle = () => {},
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const safeData = useMemo(() => (Array.isArray(data) && data.length > 0 ? data : [0]), [data]);
  const baseChartWidth = width - 80;
  const chartHeight = height - 40;
  const padding = 20;

  // simultaneous handlers
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const tapRef = useRef(null);

  // JS state(렌더용)
  const [sStart, setSStart] = useState(0);
  const [sBars, setSBars] = useState(() => {
    const len = Math.max(2, safeData.length);
    return Math.min(Math.max(2, initialBarsOnScreen), len);
  });

  // UI thread shared values
  const minBars = 2;
  const maxBars = useMemo(() => Math.max(2, safeData.length), [safeData.length]);
  const startIndex = useSharedValue(0);
  const barsOnScreen = useSharedValue(Math.min(Math.max(2, initialBarsOnScreen), Math.max(2, safeData.length)));

  // 초기: 오른쪽 정렬
  useEffect(() => {
    const desired = Math.min(Math.max(2, initialBarsOnScreen), Math.max(2, safeData.length));
    const start = Math.max(0, safeData.length - desired);
    barsOnScreen.value = desired;
    startIndex.value = start;
    setSBars(desired);
    setSStart(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeData, initialBarsOnScreen]);

  // shared → JS state 동기화 (핵심)
  useAnimatedReaction(
    () => {
      const b = Math.max(minBars, Math.min(maxBars, Math.round(barsOnScreen.value)));
      const s = Math.max(0, Math.min(safeData.length - b, Math.round(startIndex.value)));
      return { s, b };
    },
    ({ s, b }) => {
      runOnJS(setSStart)(s);
      runOnJS(setSBars)(b);
    },
    [safeData.length, minBars, maxBars]
  );

  // 가시 데이터
  const visible = useMemo(() => {
    const end = Math.min(sStart + sBars, safeData.length);
    return safeData.slice(sStart, end);
  }, [safeData, sStart, sBars]);

  // y 도메인
  const { vMin, vMax } = useMemo(() => {
    if (!visible.length) return { vMin: 0, vMax: 1 };
    let min = visible[0], max = visible[0];
    for (let i = 1; i < visible.length; i++) {
      const v = visible[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) max = min + 1;
    return { vMin: min, vMax: max };
  }, [visible]);

  // 좌표계
  const visCount = Math.max(1, visible.length);
  const denom = Math.max(1, visCount - 1);
  const chartW = baseChartWidth - 2 * padding;

  const xFor = (globalIndex) => {
    const local = globalIndex - sStart;
    const ratio = Math.max(0, Math.min(1, local / denom));
    return padding + ratio * chartW;
  };

  const indexFor = (x) => {
    const rel = Math.max(0, Math.min(1, (x - padding) / (chartW || 1)));
    return sStart + rel * denom;
  };

  const yFor = (val) => {
    const r = vMax - vMin || 1;
    return padding + (1 - (val - vMin) / r) * (chartHeight - 2 * padding);
  };

  // 툴팁
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const updateTooltip = (touchX) => {
    if (!visible.length) return;
    const idx = Math.round(indexFor(touchX));
    const clamped = clamp(idx, sStart, sStart + (visCount - 1));
    const localIdx = clamped - sStart;
    if (visible[localIdx] == null) return;
    setSelectedIndex(clamped);
    setShowTooltip(true);
    setTooltipPosition({ x: xFor(clamped), y: yFor(visible[localIdx]) });
  };
  const hideTooltip = () => { setShowTooltip(false); setSelectedIndex(null); };

  // 핀치: 확대/축소 (정수 기반)
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.bars = barsOnScreen.value;
      ctx.start = startIndex.value;
      runOnJS(onGestureToggle)(true);
    },
    onActive: (e, ctx) => {
      const w = Math.max(1, ctx.bars - 1);
      const focusIndex = ctx.start + ((e.focalX - padding) / Math.max(1, chartW)) * w;

      let nextBars = Math.round(ctx.bars / (e.scale || 1));
      nextBars = Math.max(minBars, Math.min(maxBars, nextBars));

      const leftRatio = (focusIndex - ctx.start) / Math.max(1, w);
      let nextStart = Math.round(focusIndex - leftRatio * (nextBars - 1));
      const maxStart = Math.max(0, safeData.length - nextBars);
      nextStart = Math.max(0, Math.min(maxStart, nextStart));

      startIndex.value = nextStart;
      barsOnScreen.value = nextBars;
    },
    onEnd: () => { runOnJS(onGestureToggle)(false); },
  });

  // 팬: 좌/우 이동
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.start = startIndex.value;
      ctx.bars = barsOnScreen.value;
      runOnJS(onGestureToggle)(true);
    },
    onActive: (e, ctx) => {
      const pxPerBar = chartW / Math.max(1, ctx.bars - 1);
      const deltaBars = e.translationX / Math.max(1e-6, pxPerBar);
      const maxStart = Math.max(0, safeData.length - ctx.bars);
      const nextStart = Math.max(0, Math.min(maxStart, Math.round(ctx.start - deltaBars)));
      startIndex.value = nextStart;
    },
    onEnd: () => { runOnJS(onGestureToggle)(false); },
  });

  // 탭: onEnd가 좌표 안정적
  const tapGestureHandler = useAnimatedGestureHandler({
    onEnd: (e) => runOnJS(updateTooltip)(e.x),
  });

  // Path
  const createPath = () => {
    if (visCount === 0) return '';
    if (visCount === 1) {
      const x = padding, y = yFor(visible[0]);
      return `M ${x} ${y} L ${x} ${y}`;
    }
    let d = '';
    for (let i = 0; i < visCount; i++) {
      const x = padding + (i / Math.max(1, visCount - 1)) * chartW;
      const y = yFor(visible[i]);
      if (i === 0) d += `M ${x} ${y}`;
      else {
        const prevX = padding + ((i - 1) / Math.max(1, visCount - 1)) * chartW;
        const prevY = yFor(visible[i - 1]);
        const cp1x = prevX + (x - prevX) * 0.4;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) * 0.6;
        const cp2y = y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    }
    return d;
  };

  const createAreaPath = () => {
    if (visCount === 0) return '';
    const linePath = createPath();
    const firstX = padding;
    const lastX = padding + ((visCount - 1) / Math.max(1, visCount - 1)) * chartW;
    return `${linePath} L ${lastX} ${chartHeight - padding} L ${firstX} ${chartHeight - padding} Z`;
  };

  const renderGridLines = () => {
    if (!showGrid) return null;
    const els = [];
    const horizontal = 4;
    for (let i = 0; i <= horizontal; i++) {
      const y = padding + (i / horizontal) * (chartHeight - 2 * padding);
      els.push(<Line key={`h-${i}`} x1={padding} y1={y} x2={baseChartWidth - padding} y2={y} stroke={colors.gray200} strokeWidth="1" opacity="0.4" />);
    }
    const vertical = Math.min(10, Math.max(2, Math.round(visCount / 12)));
    for (let i = 0; i <= vertical; i++) {
      const x = padding + (i / Math.max(1, vertical)) * chartW;
      els.push(<Line key={`v-${i}`} x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke={colors.gray200} strokeWidth="1" opacity="0.3" />);
    }
    return els;
  };

  const renderDataPoints = () => {
    if (visCount > 60) return null;
    const pts = [];
    for (let i = 0; i < visCount; i++) {
      const x = padding + (i / Math.max(1, visCount - 1)) * chartW;
      const y = yFor(visible[i]);
      const isSel = selectedIndex === sStart + i;
      pts.push(<Circle key={`p-${i}`} cx={x} cy={y} r={isSel ? '6' : '3'} fill={isSel ? colors.white : color} stroke={color} strokeWidth={isSel ? '3' : '2'} />);
    }
    return pts;
  };

  const renderTouchIndicator = () => {
    if (!showTooltip || selectedIndex == null) return null;
    const localIdx = selectedIndex - sStart;
    if (localIdx < 0 || localIdx >= visCount) return null;
    const x = padding + (localIdx / Math.max(1, visCount - 1)) * chartW;
    const y = yFor(visible[localIdx]);
    return (
      <>
        <Line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.7" />
        <Circle cx={x} cy={y} r="7" fill={colors.white} stroke={color} strokeWidth="3" />
      </>
    );
  };

  const linePath = useMemo(createPath, [visible, vMin, vMax, sStart, sBars, color]);
  const areaPath = useMemo(createAreaPath, [visible, vMin, vMax, sStart, sBars, color]);

  return (
    <View style={[styles.chartContainer, { height }]} onTouchEnd={hideTooltip}>
      <View style={styles.scaleInfo}>
        <Text style={styles.scaleText}>{`${Math.max(2, Math.max(1, visible.length))} pts`}</Text>
      </View>

      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={[panRef, tapRef]}
        onGestureEvent={pinchGestureHandler}
      >
        <Animated.View style={styles.gestureContainer}>
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={[pinchRef, tapRef]}
            onGestureEvent={panGestureHandler}
            minPointers={1}
            maxPointers={1}
            activeOffsetX={[-5, 5]}
            failOffsetY={[-8, 8]}
          >
            <Animated.View style={styles.gestureContainer}>
              <TapGestureHandler
                ref={tapRef}
                simultaneousHandlers={[pinchRef, panRef]}
                onGestureEvent={tapGestureHandler}
                numberOfTaps={1}
              >
                <Animated.View style={styles.chartWrapper}>
                  <View style={styles.svgContainer}>
                    <Svg width={baseChartWidth} height={chartHeight}>
                      <Defs>
                        <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                          <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
                        </LinearGradient>
                      </Defs>

                      {renderGridLines()}
                      <Path d={areaPath} fill="url(#areaGradient)" />
                      <Path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {renderDataPoints()}
                      {renderTouchIndicator()}
                    </Svg>
                  </View>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>

      {/* 가시 구간 min/max */}
      <View style={styles.valueContainer} pointerEvents="none">
        <Text style={styles.maxValue}>{Number.isFinite(vMax) ? `${valuePrefix}${vMax.toLocaleString()}` : '-'}</Text>
        <Text style={styles.minValue}>{Number.isFinite(vMin) ? `${valuePrefix}${vMin.toLocaleString()}` : '-'}</Text>
      </View>

      {/* 툴팁 */}
      {showTooltip && selectedIndex != null && visible.length > 0 && (
        <View
          style={[
            styles.tooltip,
            {
              left: Math.max(10, Math.min(baseChartWidth - 140, tooltipPosition.x - 70)),
              top: tooltipPosition.y < 60 ? tooltipPosition.y + 20 : tooltipPosition.y - 60,
            },
          ]}
        >
          <Text style={styles.tooltipValue}>
            {valuePrefix}{visible[selectedIndex - sStart] !== undefined ? visible[selectedIndex - sStart].toLocaleString() : '-'}
          </Text>
          <Text style={styles.tooltipIndex}>
            {labels?.[selectedIndex] ?? `#${selectedIndex + 1}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: { backgroundColor: '#FAFBFC', borderRadius: 12, marginVertical: spacing.md, position: 'relative', overflow: 'hidden' },
  gestureContainer: { flex: 1 },
  chartWrapper: { flex: 1, overflow: 'hidden', marginHorizontal: 10, marginVertical: 10 },
  svgContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scaleInfo: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, zIndex: 10 },
  scaleText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  valueContainer: { position: 'absolute', right: 15, top: 15, bottom: 15, justifyContent: 'space-between' },
  maxValue: { fontSize: 10, color: colors.gray600, fontWeight: '500' },
  minValue: { fontSize: 10, color: colors.gray600, fontWeight: '500' },
  tooltip: {
    position: 'absolute', backgroundColor: '#0F172A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8, zIndex: 15, alignItems: 'center',
  },
  tooltipValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  tooltipIndex: { color: '#CBD5E1', fontSize: 11, marginTop: 2, fontWeight: '500' },
});
