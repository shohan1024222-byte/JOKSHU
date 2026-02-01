import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface IDCardScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (scannedId: string) => void;
  expectedId: string;
}

export const IDCardScanner: React.FC<IDCardScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
  expectedId,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedText, setScannedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Extract student ID from scanned data
    const extractedId = extractStudentId(data);
    setScannedText(extractedId);
    
    setTimeout(() => {
      verifyScannedId(extractedId);
      setIsProcessing(false);
    }, 1000);
  };

  const extractStudentId = (data: string): string => {
    // Different patterns for extracting student ID from QR/barcode
    const patterns = [
      /ID:\s*(\d+)/i,           // ID: 12345
      /Student:\s*(\d+)/i,      // Student: 12345
      /(\d{6,10})/,             // Direct 6-10 digit number
      /SID:\s*(\d+)/i,          // SID: 12345
    ];

    for (const pattern of patterns) {
      const match = data.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If no pattern matches, return the first sequence of digits
    const digitMatch = data.match(/\d+/);
    return digitMatch ? digitMatch[0] : data;
  };

  const verifyScannedId = (scannedId: string) => {
    // Compare last 9 digits of both IDs
    const scannedLast9 = scannedId.slice(-9);
    const expectedLast9 = expectedId.slice(-9);
    
    if (scannedLast9 === expectedLast9) {
      Alert.alert(
        'সফল ✓',
        'আইডি কার্ড সত্যায়িত হয়েছে। এখন ভোট দিতে পারবেন।',
        [
          {
            text: 'ভোট দিন',
            onPress: () => {
              onScanSuccess(scannedId);
              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'ত্রুটি ❌',
        `আইডি মিলছে না!\nস্ক্যান করা আইডি: ${scannedId}\nপ্রত্যাশিত আইডি: ${expectedId}`,
        [
          {
            text: 'আবার চেষ্টা করুন',
            onPress: () => setScannedText(''),
          },
        ]
      );
    }
  };

  if (permission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text>ক্যামেরা অনুমতির জন্য অপেক্ষা করছি...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.errorText}>ক্যামেরা অ্যাক্সেস প্রয়োজন</Text>
            <Text style={styles.subtitle}>ID কার্ড স্ক্যান করার জন্য ক্যামেরা অনুমতি দিন</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.manualButton} onPress={requestPermission}>
              <Text style={styles.manualButtonText}>ক্যামেরা অনুমতি দিন</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>আইডি কার্ড স্ক্যান করুন</Text>
          <Text style={styles.subtitle}>
            আপনার আইডি কার্ডের QR/বারকোড স্ক্যান করুন
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scannedText ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417', 'aztec', 'ean13', 'ean8', 'code39', 'code128'],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </CameraView>
        </View>

        {scannedText && (
          <View style={styles.scannedInfo}>
            <Text style={styles.scannedText}>স্ক্যান করা আইডি: {scannedText}</Text>
            {isProcessing && <Text style={styles.processingText}>যাচাই করা হচ্ছে...</Text>}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>বাতিল</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff00',
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannedInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    alignItems: 'center',
  },
  scannedText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  processingText: {
    fontSize: 16,
    color: '#00ff00',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  manualButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 30,
  },
});