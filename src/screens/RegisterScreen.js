import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import useAuthStore from '../store/useAuthStore';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const handleRegister = () => {
    if (email && password) {
      register(email, password);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
      
      <Text style={styles.title}>Tạo tài khoản</Text>
      <Text style={styles.subtitle}>Bắt đầu quản lý chi tiêu nhóm dễ dàng</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        label="Tên hiển thị"
        mode="outlined"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
        activeOutlineColor={COLORS.primary}
      />
      
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        activeOutlineColor={COLORS.primary}
      />
      
      <TextInput
        label="Mật khẩu"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        activeOutlineColor={COLORS.primary}
      />
      
      <Button 
        mode="contained" 
        onPress={handleRegister} 
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor={COLORS.primary}
      >
        Đăng ký
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => navigation.navigate('Login')} 
        textColor={COLORS.primary}
      >
        Đã có tài khoản? Đăng nhập
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default RegisterScreen;
