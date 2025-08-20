import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { fetchNewsFromFirebase } from "../firebaseConfig";
import { colors, spacing, commonStyles } from "../styles/commonStyles";

export const NewsScreen = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firebase에서 뉴스 로딩
  const loadNewsFromFirebase = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }

      const firebaseNews = await fetchNewsFromFirebase();
      setNewsItems(firebaseNews);
    } catch (error) {
      console.error("❌ Firebase 뉴스 로딩 실패:", error);
      Alert.alert("알림", "뉴스를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 처리
  const onRefresh = () => {
    setRefreshing(true);
    loadNewsFromFirebase(false);
  };

  // 뉴스 항목 클릭 처리
  const handleNewsPress = (news) => {
    if (news.url && news.url !== "#") {
      Linking.canOpenURL(news.url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(news.url);
          } else {
            Alert.alert("알림", "URL을 열 수 없습니다.");
          }
        })
        .catch(() => {
          Alert.alert("알림", "링크를 열 수 없습니다.");
        });
    } else {
      Alert.alert("알림", "링크가 제공되지 않은 뉴스입니다.");
    }
  };

  useEffect(() => {
    loadNewsFromFirebase(true);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>뉴스를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={commonStyles.section}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>탄소배출권 뉴스</Text>
          <Text style={styles.subtitle}>총 {newsItems.length}개의 뉴스</Text>
        </View>

        {/* 뉴스 리스트 */}
        {newsItems.map((news) => (
          <TouchableOpacity
            key={news.id}
            style={styles.card}
            onPress={() => handleNewsPress(news)}
          >
            <Image
              source={{ uri: news.image }}
              style={styles.image}
              onError={(e) => {
                console.log("이미지 로딩 오류:", e.nativeEvent.error);
              }}
            />
            <View style={styles.content}>
              <View style={styles.categoryContainer}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: news.categoryColor },
                  ]}
                >
                  <Text style={styles.categoryText}>{news.category}</Text>
                </View>
                <Text style={styles.source}>출처: {news.source}</Text>
              </View>

              <Text style={styles.titleText} numberOfLines={3}>
                {news.title}
              </Text>
              <Text style={styles.summary} numberOfLines={3}>
                {news.summary}
              </Text>
              <Text style={styles.time}>{news.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {newsItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>표시할 뉴스가 없습니다.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadNewsFromFirebase(true)}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: colors.gray100,
    resizeMode: "cover",
  },
  content: {
    padding: spacing.lg,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  source: {
    fontSize: 12,
    color: colors.gray600,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray800,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  time: {
    fontSize: 12,
    color: colors.gray400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray600,
    textAlign: "center",
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
