import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { Account, Device, DeviceZone } from '../models/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Device'],
  endpoints: (builder) => ({
    getAccount: builder.query<Account, string>({
      query: (accountId) => `accounts/${accountId}`,
    }),
    getDevices: builder.query<Device[], string>({
      query: (accountId) => `accounts/${accountId}/devices`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Device' as const, id })),
              { type: 'Device' as const, id: 'LIST' },
            ]
          : [{ type: 'Device' as const, id: 'LIST' }],
    }),
    getDevice: builder.query<Device, string>({
      query: (deviceId) => `devices/${deviceId}`,
      providesTags: (_result, _error, deviceId) => [{ type: 'Device', id: deviceId }],
    }),
    getZones: builder.query<DeviceZone[], string>({
      query: (deviceId) => `devices/${deviceId}/zones`,
    }),
    updateDevice: builder.mutation<Device, { deviceId: string; name: string }>({
      query: ({ deviceId, name }) => ({
        url: `devices/${deviceId}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: (_result, _error, { deviceId }) => [
        { type: 'Device', id: deviceId },
        { type: 'Device', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAccountQuery,
  useGetDevicesQuery,
  useGetDeviceQuery,
  useGetZonesQuery,
  useUpdateDeviceMutation,
} = api;

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return '';
  if (
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data
  ) {
    return String((error.data as { message: string }).message);
  }
  if ('error' in error) return error.error;
  if ('message' in error && error.message) return error.message;
  return 'Something went wrong';
}
