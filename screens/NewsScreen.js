// screens/NewsScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, spacing, commonStyles } from '../styles/commonStyles';

export const NewsScreen = ({ newsItems, onNewsPress }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={commonStyles.section}>
        <Text style={styles.title}>최신 뉴스</Text>
        {newsItems.map((news) => (
          <TouchableOpacity 
            key={news.id} 
            style={styles.newsCard}
            onPress={() => onNewsPress(news)}
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
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsSummary}>{news.summary}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.lg,
  },
  newsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray100,
  },
  newsContent: {
    padding: spacing.lg,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray800,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  newsSummary: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});
