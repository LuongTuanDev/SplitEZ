import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, FAB, Avatar, Portal, Modal, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import useAuthStore from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [stats, setStats] = useState([]);
  const [openFab, setOpenFab] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const groupsData = await firestoreService.getUserGroups(user.uid);
      setGroups(groupsData);

      const expensesData = await firestoreService.getUserExpenses(user.uid);
      setExpenses(expensesData);

      // Tính toán thống kê 3 tháng
      const now = new Date();
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ 
          num: d.getMonth(), 
          label: `T${d.getMonth() + 1}`,
          amount: 0 
        });
      }

      expensesData.forEach(exp => {
        const expDate = new Date(exp.date);
        const expMonth = expDate.getMonth();
        const monthObj = months.find(m => m.num === expMonth);
        if (monthObj) {
          monthObj.amount += Number(exp.amount);
        }
      });

      const maxAmount = Math.max(...months.map(m => m.amount), 1);
      setStats(months.map(m => ({
        ...m,
        percentage: (m.amount / maxAmount) * 100
      })));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const handleJoinGroup = async () => {
    if (!joinId) return;
    try {
      await firestoreService.joinGroup(joinId, user.uid);
      setShowJoinModal(false);
      setJoinId('');
      fetchDashboardData();
      Alert.alert('Thành công', 'Bạn đã tham gia nhóm!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tham gia nhóm. Vui lòng kiểm tra mã ID.');
    }
  };

  const calculateBalances = () => {
    let youAreOwed = 0;
    let youOwe = 0;

    expenses.forEach(exp => {
      const amount = Number(exp.amount);
      if (exp.paidById === user.uid) {
        // Giả định đơn giản: chia 2 trong demo này
        youAreOwed += amount / 2;
      } else {
        youOwe += amount / 2;
      }
    });

    return { youAreOwed, youOwe };
  };

  const { youAreOwed, youOwe } = calculateBalances();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào {profile?.displayName || user?.email?.split('@')[0]}!</Text>
          <Text style={styles.summary}>Hôm nay nhóm thế nào?</Text>
        </View>
        <Avatar.Image size={48} source={{ uri: `https://ui-avatars.com/api/?name=${profile?.displayName || user?.email}` }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
      >
        <Card style={styles.balanceCard}>
          <LinearGradient
            colors={[COLORS.primary, '#6366f1']}
            style={styles.gradient}
          >
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Bạn được nợ</Text>
                <Text style={styles.balanceAmount}>{youAreOwed.toLocaleString()}đ</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Bạn nợ</Text>
                <Text style={[styles.balanceAmount, { color: '#fecaca' }]}>{youOwe.toLocaleString()}đ</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Chi tiêu 3 tháng gần nhất</Text>
          <View style={styles.chartContainer}>
            {stats.map((s, index) => (
              <View key={index} style={styles.chartRow}>
                <Text style={styles.chartMonth}>{s.month}</Text>
                <View style={styles.barBackground}>
                   <View style={[styles.chartBar, { width: `${Math.max(s.percentage, 2)}%` }]} />
                </View>
                <Text style={styles.chartValue}>{(s.amount / 1000).toFixed(0)}K</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Nhóm của bạn</Text>
        
        {groups.map((group) => (
          <TouchableOpacity 
            key={group.id} 
            onPress={() => navigation.navigate('GroupDetails', { groupId: group.id, groupName: group.name })}
          >
            <Card style={styles.groupCard} mode="outlined">
              <Card.Title
                title={group.name}
                subtitle={`${group.members?.length || 1} thành viên`}
                left={(props) => <Avatar.Icon {...props} icon="account-group" backgroundColor={COLORS.primary} />}
                right={(props) => <IconButton {...props} icon="chevron-right" />}
              />
            </Card>
          </TouchableOpacity>
        ))}

        {groups.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào.</Text>
            <Button mode="contained" onPress={() => navigation.navigate('CreateGroup')} style={{marginTop: 10}} buttonColor={COLORS.primary}>
              Tạo nhóm ngay
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal visible={showJoinModal} onDismiss={() => setShowJoinModal(false)} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Tham gia nhóm</Text>
          <TextInput
            label="Nhập mã ID Nhóm"
            value={joinId}
            onChangeText={setJoinId}
            mode="outlined"
            style={{ marginBottom: 20 }}
          />
          <Button mode="contained" onPress={handleJoinGroup} buttonColor={COLORS.primary}>Xác nhận</Button>
        </Modal>
      </Portal>

      <FAB.Group
        open={openFab}
        visible
        icon={openFab ? 'close' : 'plus'}
        actions={[
          { icon: 'account-plus', label: 'Tham gia nhóm', onPress: () => setShowJoinModal(true) },
          { icon: 'plus', label: 'Tạo nhóm mới', onPress: () => navigation.navigate('CreateGroup') },
        ]}
        onStateChange={({ open }) => setOpenFab(open)}
        fabStyle={{ backgroundColor: COLORS.primary }}
        color={COLORS.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  greeting: { ...FONTS.h2, color: COLORS.text },
  summary: { ...FONTS.body3, color: COLORS.textSecondary },
  scrollContent: { padding: 20, paddingBottom: 100 },
  balanceCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, elevation: 4 },
  gradient: { padding: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  verticalDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  chartSection: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 24 },
  sectionTitle: { ...FONTS.h3, marginBottom: 16 },
  chartContainer: { marginTop: 8 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chartMonth: { width: 30, color: COLORS.textSecondary },
  barBackground: { flex: 1, height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, marginHorizontal: 10 },
  chartBar: { height: 10, backgroundColor: COLORS.primary, borderRadius: 5 },
  chartValue: { width: 40, textAlign: 'right', fontSize: 12, color: COLORS.textSecondary },
  groupCard: { marginBottom: 12, backgroundColor: COLORS.white, borderRadius: 12 },
  modalContent: { backgroundColor: COLORS.white, padding: 20, margin: 20, borderRadius: 12 },
  modalTitle: { ...FONTS.h2, marginBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textSecondary },
});

export default DashboardScreen;
