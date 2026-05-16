import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Avatar, FAB, Searchbar, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import useAuthStore from '../store/useAuthStore';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinId, setJoinId] = useState('');
  
  const user = useAuthStore((state) => state.user);

  const fetchGroups = async () => {
    try {
      const data = await firestoreService.getUserGroups(user.uid);
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const onChangeSearch = query => setSearchQuery(query);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = async () => {
    if (!joinId) return;
    try {
      await firestoreService.joinGroup(joinId, user.uid);
      setShowJoinModal(false);
      setJoinId('');
      fetchGroups();
    } catch (error) {
      console.error(error);
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, groupName: item.name })}
    >
      <Card style={styles.groupCard} mode="elevated">
        <Card.Title
          title={item.name}
          subtitle={`${item.members?.length || 0} thành viên`}
          left={(props) => <Avatar.Icon {...props} icon="account-group" backgroundColor={COLORS.primary} />}
          right={(props) => <Text style={styles.groupDate}>{new Date(item.createdAt?.toDate()).toLocaleDateString('vi-VN')}</Text>}
        />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhóm của bạn</Text>
        <Searchbar
          placeholder="Tìm kiếm nhóm..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy nhóm nào khớp.' : 'Bạn chưa tham gia nhóm nào.'}
            </Text>
            {!searchQuery && (
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('CreateGroup')}
                style={styles.createBtn}
                buttonColor={COLORS.primary}
              >
                Tạo nhóm ngay
              </Button>
            )}
          </View>
        )}
      />

      <Portal>
        <Modal 
          visible={showJoinModal} 
          onDismiss={() => setShowJoinModal(false)} 
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Tham gia nhóm</Text>
          <TextInput
            label="Mã ID Nhóm"
            value={joinId}
            onChangeText={setJoinId}
            mode="outlined"
            style={styles.modalInput}
            activeOutlineColor={COLORS.primary}
          />
          <Button mode="contained" onPress={handleJoinGroup} buttonColor={COLORS.primary}>
            Tham gia
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
        color={COLORS.white}
      />
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
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  groupDate: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginRight: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: SIZES.radius,
  },
  modalTitle: {
    ...FONTS.h2,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
});

export default GroupsScreen;
