import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // 화면 너비의 85%

export const LatestNews = ({ newsItems = [], onNewsPress = () => {}, newsLoading = false }) => {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 스크롤 (newsItems 있을 때만)
  useEffect(() => {
    if (newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % newsItems.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * (CARD_WIDTH + spacing.md),
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000); // 4초마다 자동 스크롤

    return () => clearInterval(interval);
  }, [newsItems.length]);

  // 로딩 중일 때
  if (newsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>뉴스를 불러오는 중...</Text>
      </View>
    );
  }

  // 데이터 없을 때
  if (newsItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>표시할 뉴스가 없습니다.</Text>
      </View>
    );
  }

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + spacing.md));
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.md}
        snapToAlignment="start"
        contentInset={{ left: spacing.lg, right: spacing.lg }}
        contentContainerStyle={styles.scrollContainer}
        onMomentumScrollEnd={handleScroll}
      >
        {newsItems.map((news, index) => (
          <TouchableOpacity
            key={news.id}
            style={[styles.newsCard, { width: CARD_WIDTH }]}
            onPress={() => onNewsPress(news)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: news.image }} 
              style={styles.newsImage}
              onError={(e) => {
                console.log('이미지 로딩 오류:', e.nativeEvent.error);
              }}
            />
            
            {/* 그라데이션 오버레이 효과 */}
            <View style={styles.overlay} />
            
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: news.categoryColor },
                  ]}
                >
                  <Text style={styles.categoryTagText}>
                    {news.category}
                  </Text>
                </View>
                <Text style={styles.newsTime}>{news.time}</Text>
              </View>
              
              <Text style={styles.newsTitle} numberOfLines={3}>
                {news.title}
              </Text>
              
              <Text style={styles.newsSource}>
                출처: {news.source}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* 페이지 인디케이터 */}
      <View style={styles.indicatorContainer}>
        {newsItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.gray300,
                opacity: index === currentIndex ? 1 : 0.5,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContainer: {
    paddingHorizontal: spacing.sm,
  },
  newsCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginRight: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  },
  newsContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  newsTime: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.8,
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  newsSource: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    color: colors.gray500,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    color: colors.gray500,
    fontSize: 14,
  },
});