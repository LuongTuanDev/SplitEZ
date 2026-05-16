import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Avatar, List, Divider, Switch, Portal, Modal, TextInput } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import useAuthStore from '../store/useAuthStore';
import { firestoreService } from '../api/firestoreService';

const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const logout = useAuthStore((state) => state.logout);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!newName) return;
    setLoading(true);
    try {
      await firestoreService.saveUserProfile(user.uid, { displayName: newName });
      setProfile({ ...profile, displayName: newName });
      setShowEditModal(false);
      Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          size={100} 
          source={{ uri: `https://ui-avatars.com/api/?name=${profile?.displayName || user?.email}&size=200&background=10B981&color=fff` }} 
        />
        <Text style={styles.userName}>{profile?.displayName || user?.email?.split('@')[0]}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>Cài đặt tài khoản</List.Subheader>
          <List.Item
            title="Chỉnh sửa hồ sơ"
            description={profile?.displayName ? `Biệt danh: ${profile.displayName}` : 'Chưa thiết lập biệt danh'}
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            onPress={() => setShowEditModal(true)}
          />
          <List.Item
            title="Thông báo"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} color={COLORS.primary} />}
          />
        </List.Section>
        
        <Divider />

        <Portal>
          <Modal 
            visible={showEditModal} 
            onDismiss={() => setShowEditModal(false)} 
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Cập nhật biệt danh</Text>
            <Text style={styles.modalSubtitle}>Tên này sẽ hiển thị với các thành viên khác trong nhóm</Text>
            <TextInput
              label="Tên / Biệt danh"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor={COLORS.primary}
            />
            <View style={styles.modalButtons}>
              <Button mode="text" onPress={() => setShowEditModal(false)}>Hủy</Button>
              <Button mode="contained" onPress={handleUpdateProfile} loading={loading} buttonColor={COLORS.primary}>Lưu</Button>
            </View>
          </Modal>
        </Portal>
        
        <List.Section>
          <List.Subheader>Ứng dụng</List.Subheader>
          <List.Item
            title="Điều khoản sử dụng"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          />
          <List.Item
            title="Liên hệ hỗ trợ"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
          />
        </List.Section>

        <Button 
          mode="text" 
          onPress={logout} 
          style={styles.logoutButton}
          textColor={COLORS.error}
          labelStyle={{ fontSize: 14 }}
        >
          Đăng xuất
        </Button>
      </View>
      
      <Text style={styles.version}>Phiên bản 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: COLORS.white,
  },
  userName: {
    ...FONTS.h2,
    marginTop: 16,
    color: COLORS.text,
  },
  userEmail: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: SIZES.padding / 2,
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  version: {
    ...FONTS.caption,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.textSecondary,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    margin: 20,
    borderRadius: SIZES.radius,
  },
  modalTitle: {
    ...FONTS.h2,
    marginBottom: 8,
    color: COLORS.text,
  },
  modalSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});

export default ProfileScreen;
