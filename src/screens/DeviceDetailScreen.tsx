import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getDevice, getZones, updateDevice } from '../api/client';
import { Device, DeviceZone } from '../models/types';

type Props = {
  deviceId: string;
  onBack: () => void;
};

export default function DeviceDetailScreen({ deviceId, onBack }: Props) {
  const [device, setDevice] = useState<Device | null>(null);
  const [zones, setZones] = useState<DeviceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dev, zns] = await Promise.all([getDevice(deviceId), getZones(deviceId)]);
        setDevice(dev);
        setZones(zns);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deviceId]);

  async function handleRename() {
    if (!device || !editName.trim()) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const updated = await updateDevice(device.id, { name: editName.trim() });
      setDevice(updated);
      setIsEditing(false);
    } catch (e: unknown) {
      setRenameError(e instanceof Error ? e.message : 'Rename failed. Please try again.');
    } finally {
      setRenaming(false);
    }
  }

  function startEditing() {
    setEditName(device?.name ?? '');
    setRenameError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setRenameError(null);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (error || !device) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠ {error ?? 'Device not found'}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtnStandalone}>
          <Text style={styles.backBtnStandaloneText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOffline = device.connectivity === 'offline';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isOffline && styles.headerOffline]}>
        <TouchableOpacity onPress={onBack} style={styles.backRow} accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Dashboard</Text>
        </TouchableOpacity>

        {isEditing ? (
          <View>
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                editable={!renaming}
                returnKeyType="done"
                onSubmitEditing={handleRename}
                accessibilityLabel="Device name"
              />
              <TouchableOpacity
                onPress={handleRename}
                disabled={renaming || !editName.trim()}
                style={[
                  styles.saveBtn,
                  (renaming || !editName.trim()) && styles.saveBtnDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save name"
              >
                {renaming ? (
                  <ActivityIndicator size="small" color="#2e7d32" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEditing}
                disabled={renaming}
                style={styles.cancelBtn}
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {renameError && <Text style={styles.renameError}>⚠ {renameError}</Text>}
          </View>
        ) : (
          <View style={styles.titleRow}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <TouchableOpacity
              onPress={startEditing}
              style={styles.editBtn}
              accessibilityRole="button"
              accessibilityLabel="Edit device name"
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>● Device is offline</Text>
          </View>
        )}
      </View>

      {/* Device Info */}
      <View style={styles.infoSection}>
        <InfoRow label="Location" value={device.location} />
        <InfoRow label="Status" value={capitalize(device.state)} />
        <InfoRow label="Battery" value={`${device.batteryLevel}%`} />
        <InfoRow
          label="Connectivity"
          value={capitalize(device.connectivity)}
          highlight={isOffline}
        />
      </View>

      {/* Zones */}
      <Text style={styles.sectionTitle}>Zones ({zones.length})</Text>
      <FlatList
        data={zones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.zoneRow}>
            <View style={[styles.zoneIndicator, item.isActive && styles.zoneIndicatorActive]} />
            <Text style={styles.zoneName}>{item.name}</Text>
            {item.isActive && <Text style={styles.activeLabel}>Active</Text>}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueOffline]}>{value}</Text>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  backBtnStandalone: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnStandaloneText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerOffline: {
    backgroundColor: '#546e7a',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backArrow: {
    color: '#a5d6a7',
    fontSize: 18,
  },
  backLabel: {
    color: '#a5d6a7',
    fontSize: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#a5d6a7',
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  saveBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#2e7d32',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelBtn: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#a5d6a7',
    fontSize: 14,
  },
  renameError: {
    color: '#ffcdd2',
    fontSize: 13,
    marginTop: 8,
  },
  offlineBanner: {
    backgroundColor: 'rgba(0,0,0,0.20)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  offlineBannerText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f0',
  },
  infoLabel: {
    color: '#5a6575',
    fontSize: 14,
  },
  infoValue: {
    color: '#1c2430',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValueOffline: {
    color: '#bf360c',
    fontWeight: '600',
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
  zoneRow: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  zoneIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c4cdd6',
  },
  zoneIndicatorActive: {
    backgroundColor: '#2e7d32',
  },
  zoneName: {
    flex: 1,
    fontSize: 15,
    color: '#1c2430',
  },
  activeLabel: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f2f0',
    marginLeft: 20,
  },
});
