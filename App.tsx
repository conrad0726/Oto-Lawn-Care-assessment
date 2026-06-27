import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Device } from './src/models/types';
import DashboardScreen from './src/screens/DashboardScreen';
import DeviceDetailScreen from './src/screens/DeviceDetailScreen';

type Screen = { name: 'dashboard' } | { name: 'device'; deviceId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });

  function handleSelectDevice(device: Device) {
    setScreen({ name: 'device', deviceId: device.id });
  }

  function handleBack() {
    setScreen({ name: 'dashboard' });
  }

  return (
    <View style={styles.outer}>
      <View style={styles.root}>
        <StatusBar style="light" />
        {screen.name === 'dashboard' && (
          <DashboardScreen onSelectDevice={handleSelectDevice} />
        )}
        {screen.name === 'device' && (
          <DeviceDetailScreen deviceId={screen.deviceId} onBack={handleBack} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
  },
});
