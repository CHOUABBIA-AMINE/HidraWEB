import type { AxiosRequestConfig } from 'axios';

import { hidraAxios } from '@/api/client/hidraAxios';

export async function hidraHttpClient<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await hidraAxios.request<T>(config);
  return response.data;
}
