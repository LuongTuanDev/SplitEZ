import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import useAuthStore from '../store/useAuthStore';

const ReviewExpenseScreen = ({ route, navigation }) => {
  const { groupId, result } = route.params;
  const [description, setDescription] = useState(result?.description || 'Ăn uống');
  const [amount, setAmount] = useState(result?.totalAmount?.toString() || '0');
  const [items, setItems] = useState(result?.items || []);
  const [serviceFee, setServiceFee] = useState(result?.serviceFee || 0);
  const [discount, setDiscount] = useState(result?.discount || 0);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const deleteItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    const newSubtotal = newItems.reduce((sum, item) => sum + item.price, 0);
    const newTotal = newSubtotal + Number(serviceFee) - Number(discount);
    setAmount(newTotal.toString());
  };

  const handleSave = async () => {
    if (!description || !amount) return;
    setLoading(true);
    try {
      const groupData = await firestoreService.getGroupDetails(groupId);
      const participants = groupData.members || [user.uid];

      await firestoreService.addExpense(groupId, {
        description,
        amount: Number(amount),
        subtotal: items.reduce((sum, i) => sum + i.price, 0),
        serviceFee: Number(serviceFee),
        discount: Number(discount),
        items: items,
        paidBy: user.email,
        paidById: user.uid,
        participants: participants,
        date: new Date().toISOString(),
      });
      navigation.navigate('GroupDetails', { groupId, groupName: route.params.groupName });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Xác nhận hóa đơn</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            label="Tên hóa đơn / Cửa hàng"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            activeOutlineColor={COLORS.primary}
          />
          
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Chi tiết các món</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableLabel, { flex: 2 }]}>Tên món</Text>
              <Text style={[styles.tableLabel, { flex: 1, textAlign: 'right' }]}>Giá tiền</Text>
              <View style={{ width: 40 }} />
            </View>
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.itemName, { flex: 2 }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemPrice, { flex: 1, textAlign: 'right' }]}>{item.price.toLocaleString()}đ</Text>
                <IconButton 
                  icon="delete-outline" 
                  iconColor={COLORS.error} 
                  size={20} 
                  onPress={() => deleteItem(item.id)}
                  style={{ margin: 0, padding: 0 }}
                />
              </View>
            ))}
          </View>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí dịch vụ / VAT</Text>
              <TextInput
                mode="flat"
                value={serviceFee.toString()}
                onChangeText={(val) => {
                  setServiceFee(val);
                  const sub = items.reduce((sum, i) => sum + i.price, 0);
                  setAmount((sub + Number(val) - Number(discount)).toString());
                }}
                keyboardType="numeric"
                style={styles.smallInput}
              />
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <TextInput
                mode="flat"
                value={discount.toString()}
                onChangeText={(val) => {
                  setDiscount(val);
                  const sub = items.reduce((sum, i) => sum + i.price, 0);
                  setAmount((sub + Number(serviceFee) - Number(val)).toString());
                }}
                keyboardType="numeric"
                textColor={COLORS.error}
                style={styles.smallInput}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text>
            <Text style={styles.totalValue}>{Number(amount).toLocaleString()}đ</Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading || !description || !amount}
            style={styles.button}
            buttonColor={COLORS.primary}
          >
            Xác nhận & Lưu hóa đơn
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    paddingBottom: 10,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  itemsSection: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 16,
    color: COLORS.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    marginBottom: 8,
  },
  tableLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  itemName: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  itemPrice: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  summarySection: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  smallInput: {
    width: 120,
    height: 40,
    backgroundColor: 'transparent',
    textAlign: 'right',
  },
  divider: {
    marginVertical: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  totalLabel: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  totalValue: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: SIZES.radius,
    paddingVertical: 6,
    marginBottom: 40,
  },
});

export default ReviewExpenseScreen;
