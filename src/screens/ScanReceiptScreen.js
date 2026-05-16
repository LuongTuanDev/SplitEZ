import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { ocrService } from '../api/ocrService';

const ScanReceiptScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'white', marginBottom: 20 }}>Chúng tôi cần quyền truy cập camera để quét hóa đơn</Text>
        <Button mode="contained" onPress={requestPermission} buttonColor={COLORS.primary}>Cho phép truy cập</Button>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        setPreviewImage(photo.uri);
        processImage(photo.base64);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Chuẩn mới thay cho MediaTypeOptions
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
      processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64) => {
    setLoading(true);
    try {
      const result = await ocrService.scanReceipt(base64);
      setLoading(false);
      navigation.navigate('ReviewExpense', { groupId, groupName, result });
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Lỗi", "Không thể nhận diện hóa đơn. Bạn có muốn nhập tay không?", [
        { text: "Thử lại", onPress: () => setPreviewImage(null) },
        { text: "Nhập tay", onPress: () => navigation.navigate('ReviewExpense', { groupId, groupName, result: { totalAmount: 0 } }) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {previewImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewImage }} style={styles.preview} />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator animating={true} color={COLORS.white} size="large" />
              <Text style={styles.loadingText}>Đang nhận diện hóa đơn...</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={styles.overlay}>
            <View style={styles.header}>
              <IconButton
                icon="close"
                iconColor={COLORS.white}
                size={30}
                onPress={() => navigation.goBack()}
              />
              <IconButton icon="image-multiple" iconColor={COLORS.white} size={30} onPress={pickImage} />
            </View>

            <View style={styles.footer}>
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>Đưa hóa đơn vào khung hình</Text>
              </View>
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={takePicture}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} size="large" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  hintContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  hintText: {
    color: COLORS.white,
    ...FONTS.body3,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body1,
    color: COLORS.white,
    marginTop: 20,
  },
});

export default ScanReceiptScreen;
