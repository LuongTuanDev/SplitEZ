import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { firestoreService } from '../api/firestoreService';
import useAuthStore from '../store/useAuthStore';

const CreateGroupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    try {
      await firestoreService.createGroup({ name, description }, user.uid);
      navigation.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Tạo nhóm mới</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.content}>
        <TextInput
          label="Tên nhóm (ví dụ: Đi chơi Đà Lạt)"
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          activeOutlineColor={COLORS.primary}
        />
        
        <TextInput
          label="Mô tả (không bắt buộc)"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
          activeOutlineColor={COLORS.primary}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !name}
          style={styles.button}
          buttonColor={COLORS.primary}
        >
          Tạo nhóm
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  content: {
    padding: SIZES.padding,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: SIZES.radius,
  },
});

export default CreateGroupScreen;
