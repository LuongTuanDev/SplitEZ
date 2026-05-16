import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import useAuthStore from '../store/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const handleLogin = () => {
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SplitEZ</Text>
      <Text style={styles.subtitle}>Chia tiền thông minh, vui vẻ cả nhóm</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

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
        onPress={handleLogin} 
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor={COLORS.primary}
      >
        Đăng nhập
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => navigation.navigate('Register')} 
        textColor={COLORS.primary}
      >
        Chưa có tài khoản? Đăng ký ngay
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
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

export default LoginScreen;
