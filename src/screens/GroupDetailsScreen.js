import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Text, Card, FAB, List, Avatar, Divider, Portal, Modal, Button, IconButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { simplifyDebts } from '../utils/debtUtils';

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [openFab, setOpenFab] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchExpenses = async () => {
    try {
      const data = await firestoreService.getGroupExpenses(groupId);
      setExpenses(data);
      
      const transactions = data.map(exp => ({
        debtor: 'Others', 
        creditor: exp.paidBy,
        amount: Number(exp.amount)
      }));
      const simplified = simplifyDebts(transactions);
      setBalances(simplified);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      "Xóa hóa đơn",
      "Bạn có chắc muốn xóa hóa đơn này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            await firestoreService.deleteExpense(expenseId);
            fetchExpenses();
          }
        }
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Giải tán nhóm",
      "Hành động này sẽ xóa vĩnh viễn nhóm này. Bạn có chắc không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận Xóa", 
          style: "destructive",
          onPress: async () => {
            await firestoreService.deleteGroup(groupId);
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const renderExpenseItem = ({ item }) => (
    <List.Item
      title={item.description}
      description={`${item.paidBy} đã trả • ${new Date(item.date).toLocaleDateString('vi-VN')}`}
      onPress={() => {
        setSelectedExpense(item);
        setShowDetailModal(true);
      }}
      right={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.expenseAmount}>{item.amount.toLocaleString()}đ</Text>
          <IconButton icon="delete-outline" iconColor={COLORS.error} size={20} onPress={() => handleDeleteExpense(item.id)} />
        </View>
      )}
      left={(props) => <Avatar.Icon {...props} icon="cash" backgroundColor={COLORS.surface} color={COLORS.primary} />}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <Text style={styles.groupName}>{groupName}</Text>
          </View>
          <IconButton icon="trash-can-outline" iconColor={COLORS.error} onPress={handleDeleteGroup} />
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={() => (
          <View style={styles.summaryContainer}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Tổng chi tiêu nhóm</Text>
                <Text style={styles.totalAmount}>
                  {expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString()}đ
                </Text>
                <Button 
                  mode="text" 
                  onPress={() => setShowQR(true)}
                  textColor={COLORS.white}
                  icon="account-plus"
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                >
                  Mời thành viên
                </Button>
              </Card.Content>
            </Card>

            <Portal>
              <Modal 
                visible={showQR} 
                onDismiss={() => setShowQR(false)} 
                contentContainerStyle={styles.modalContent}
              >
                <Text style={styles.modalTitle}>Mời vào nhóm</Text>
                <Text style={styles.modalSubtitle}>Đưa mã này cho bạn bè để tham gia nhóm của bạn</Text>
                <View style={styles.qrContainer}>
                  <QRCode value={groupId} size={200} />
                </View>
                <Text style={styles.groupIdText}>ID Nhóm: {groupId}</Text>
                <Button mode="contained" onPress={() => setShowQR(false)} buttonColor={COLORS.primary}>
                  Đóng
                </Button>
              </Modal>

              <Modal
                visible={showDetailModal}
                onDismiss={() => setShowDetailModal(false)}
                contentContainerStyle={styles.detailModalContent}
              >
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>{selectedExpense?.description}</Text>
                  <Text style={styles.detailDate}>
                    {selectedExpense?.date && new Date(selectedExpense.date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                
                <Divider style={{ marginVertical: 10 }} />
                
                <ScrollView style={{ maxHeight: 300 }}>
                  {selectedExpense?.items && selectedExpense.items.length > 0 ? (
                    selectedExpense.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemNameText}>{item.name}</Text>
                        <Text style={styles.itemPriceText}>{item.price.toLocaleString()}đ</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noItemsText}>Hóa đơn này không có chi tiết các món.</Text>
                  )}
                </ScrollView>

                <Divider style={{ marginVertical: 10 }} />
                
                <View style={styles.summaryRows}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>
                      {(selectedExpense?.subtotal || selectedExpense?.items?.reduce((sum, i) => sum + i.price, 0) || 0).toLocaleString()}đ
                    </Text>
                  </View>
                  
                  {selectedExpense?.serviceFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Phí dịch vụ / VAT</Text>
                      <Text style={styles.summaryValue}>+{selectedExpense.serviceFee.toLocaleString()}đ</Text>
                    </View>
                  )}

                  {selectedExpense?.discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Giảm giá</Text>
                      <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{selectedExpense.discount.toLocaleString()}đ</Text>
                    </View>
                  )}
                </View>

                <Divider style={{ marginVertical: 10, height: 2, backgroundColor: COLORS.text }} />
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                  <Text style={styles.totalValueText}>{selectedExpense?.amount?.toLocaleString()}đ</Text>
                </View>

                <Button 
                  mode="contained" 
                  onPress={() => setShowDetailModal(false)} 
                  buttonColor={COLORS.primary}
                  style={{ marginTop: 20 }}
                >
                  Đóng
                </Button>
              </Modal>
            </Portal>

            {balances.length > 0 && (
              <View style={styles.balancesContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Quyết toán nợ</Text>
                  <View style={styles.optimizationBadge}>
                    <Text style={styles.optimizationText}>Đã tối ưu</Text>
                  </View>
                </View>
                {balances.map((b, i) => (
                  <View key={i} style={styles.debtCard}>
                    <View style={styles.debtInfo}>
                      <View style={styles.personContainer}>
                        <Avatar.Text size={32} label="MN" backgroundColor="#e2e8f0" color="#475569" />
                        <Text style={styles.personName}>Mọi người</Text>
                      </View>
                      
                      <View style={styles.arrowContainer}>
                        <MaterialCommunityIcons name="arrow-right-thick" size={20} color={COLORS.primary} />
                        <Text style={styles.debtAmountLabel}>{b.amount.toLocaleString()}đ</Text>
                      </View>

                      <View style={styles.personContainer}>
                        <Avatar.Text 
                          size={32} 
                          label={b.to.substring(0, 2).toUpperCase()} 
                          backgroundColor={COLORS.primary} 
                          color={COLORS.white} 
                        />
                        <Text style={styles.personName} numberOfLines={1}>{b.to}</Text>
                      </View>
                    </View>
                  </View>
                ))}
                <Divider style={{ marginVertical: 20 }} />
              </View>
            )}

            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có hóa đơn nào.</Text>
          </View>
        )}
      />

      <FAB.Group
        open={openFab}
        visible
        icon={openFab ? 'close' : 'plus'}
        actions={[
          {
            icon: 'pencil',
            label: 'Nhập thủ công',
            onPress: () => navigation.navigate('ReviewExpense', { groupId, groupName, result: { totalAmount: 0 } }),
          },
          {
            icon: 'camera',
            label: 'Quét hóa đơn',
            onPress: () => navigation.navigate('ScanReceipt', { groupId, groupName }),
          },
        ]}
        onStateChange={({ open }) => setOpenFab(open)}
        fabStyle={{ backgroundColor: COLORS.primary }}
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
  groupName: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  summaryContainer: {
    padding: SIZES.padding,
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    marginBottom: 24,
  },
  summaryTitle: {
    ...FONTS.body2,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  totalAmount: {
    ...FONTS.h1,
    color: COLORS.white,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optimizationBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  optimizationText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
  },
  debtCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
  },
  debtInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personContainer: {
    alignItems: 'center',
    width: 80,
  },
  personName: {
    ...FONTS.body4,
    color: COLORS.text,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  arrowContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtAmountLabel: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginTop: 2,
  },
  balancesContainer: {
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  balanceText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  balanceValue: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 100,
  },
  expenseAmount: {
    ...FONTS.h3,
    color: COLORS.text,
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  modalTitle: {
    ...FONTS.h2,
    marginBottom: 8,
  },
  modalSubtitle: {
    ...FONTS.body3,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  groupIdText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 24,
    fontFamily: 'System', // Use mono if available
  },
  detailModalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: SIZES.radius,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    flex: 1,
  },
  detailDate: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemNameText: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 2,
  },
  itemPriceText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  noItemsText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalLabel: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  totalValueText: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  summaryRows: {
    marginTop: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default GroupDetailsScreen;
