import { Account, Device, DeviceZone, UpdateDeviceInput } from '../models/types';

export async function getAccount(accountId: string): Promise<Account> {
  const res = await fetch(`/api/accounts/${accountId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Failed to load account' }));
    throw new Error(body.message ?? 'Failed to load account');
  }
  return res.json();
}

export async function getDevices(accountId: string): Promise<Device[]> {
  const res = await fetch(`/api/accounts/${accountId}/devices`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Failed to load devices' }));
    throw new Error(body.message ?? 'Failed to load devices');
  }
  return res.json();
}

export async function getDevice(deviceId: string): Promise<Device> {
  const res = await fetch(`/api/devices/${deviceId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Failed to load device' }));
    throw new Error(body.message ?? 'Failed to load device');
  }
  return res.json();
}

export async function getZones(deviceId: string): Promise<DeviceZone[]> {
  const res = await fetch(`/api/devices/${deviceId}/zones`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Failed to load zones' }));
    throw new Error(body.message ?? 'Failed to load zones');
  }
  return res.json();
}

export async function updateDevice(
  deviceId: string,
  input: UpdateDeviceInput,
): Promise<Device> {
  const res = await fetch(`/api/devices/${deviceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Update failed. Please try again.' }));
    throw new Error(body.message ?? 'Update failed. Please try again.');
  }
  return res.json();
}
