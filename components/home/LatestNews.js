// ========== 4. 최신 뉴스 ==========
// components/home/LatestNews.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, spacing, commonStyles } from '../../styles/commonStyles';

export const LatestNews = ({ newsItems, onNewsPress, onMorePress }) => {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: currentIndex * 120,
        animated: true,
      });
    }
  }, [currentIndex]);

  return (
    <View style={commonStyles.section}>
      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>최신 뉴스</Text>
        <TouchableOpacity onPress={() => onMorePress('뉴스')}>
          <Text style={commonStyles.moreButton}>모두 보기</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        ref={scrollRef}
        style={styles.newsScrollContainer}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / 120);
          setCurrentIndex(index);
        }}
      >
        {newsItems.map((news, index) => (
          <TouchableOpacity 
            key={news.id} 
            style={[styles.newsCard, { height: 120 }]}
            onPress={() => onNewsPress(news)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: news.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <View style={[styles.categoryTag, { backgroundColor: `${news.categoryColor}20` }]}>
                  <Text style={[styles.categoryTagText, { color: news.categoryColor }]}>
                    {news.category}
                  </Text>
                </View>
                <Text style={styles.newsTime}>{news.time}</Text>
              </View>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {news.title}
              </Text>
              <View style={styles.newsIndicator}>
                {newsItems.map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.newsIndicatorDot,
                      { backgroundColor: i === index ? news.categoryColor : colors.gray200 }
                    ]} 
                  />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  newsScrollContainer: {
    maxHeight: 140,
  },
  newsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  newsImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.gray100,
  },
  newsContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 11,
    color: colors.gray400,
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  newsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newsIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});
