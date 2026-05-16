import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, List, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import useAuthStore from '../store/useAuthStore';

const ActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useAuthStore((state) => state.user);

  const fetchActivities = async () => {
    try {
      const expenses = await firestoreService.getUserExpenses(user.uid);
      // Sort by date descending
      const sorted = expenses.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      setActivities(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const renderActivityItem = ({ item }) => {
    const date = item.createdAt?.toDate() ? new Date(item.createdAt.toDate()).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Vừa xong';

    return (
      <List.Item
        title={item.description}
        description={`${item.paidBy} đã chi ${item.amount}đ • ${date}`}
        left={props => <Avatar.Icon {...props} icon="cash" backgroundColor={COLORS.surface} color={COLORS.primary} />}
        right={props => <Text style={styles.amount}>-{item.amount}đ</Text>}
        style={styles.listItem}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoạt động gần đây</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivityItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Avatar.Icon size={80} icon="history" backgroundColor={COLORS.surface} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Chưa có hoạt động nào được ghi lại.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: 40,
  },
  listItem: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  amount: {
    ...FONTS.h3,
    color: COLORS.error,
    alignSelf: 'center',
    marginRight: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ActivityScreen;
