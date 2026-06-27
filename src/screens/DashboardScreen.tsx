import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAccount, getDevices } from '../api/client';
import { Account, Device } from '../models/types';

type Props = {
  onSelectDevice: (device: Device) => void;
};

export default function DashboardScreen({ onSelectDevice }: Props) {
  const [account, setAccount] = useState<Account | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [acc, devs] = await Promise.all([
          getAccount('account-1'),
          getDevices('account-1'),
        ]);
        setAccount(acc);
        setDevices(devs);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading your dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{account?.name}</Text>
        <Text style={styles.userCity}>{account?.city}</Text>
      </View>

      <Text style={styles.sectionTitle}>My Devices</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOffline = item.connectivity === 'offline';
          return (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => onSelectDevice(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.zoneIds.length} zones${isOffline ? ', offline' : ''}`}
            >
              <View style={styles.deviceCardInner}>
                <View style={styles.deviceCardLeft}>
                  <View style={styles.deviceNameRow}>
                    <Text style={[styles.deviceName, isOffline && styles.deviceNameOffline]}>
                      {item.name}
                    </Text>
                    {isOffline && (
                      <View style={styles.offlineBadge}>
                        <Text style={styles.offlineBadgeText}>Offline</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.deviceZones}>{item.zoneIds.length} zones</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#5a6575',
    fontSize: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  userName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  userCity: {
    color: '#a5d6a7',
    fontSize: 15,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a6575',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deviceCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c2430',
  },
  deviceNameOffline: {
    color: '#78909c',
  },
  deviceZones: {
    fontSize: 13,
    color: '#5a6575',
    marginTop: 3,
  },
  offlineBadge: {
    backgroundColor: '#fbe9e7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlineBadgeText: {
    color: '#bf360c',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    color: '#c4cdd6',
    fontSize: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f2f0',
    marginLeft: 20,
  },
});
