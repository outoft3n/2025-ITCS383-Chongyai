import axios from 'axios';
import { getApiErrorMessage } from '@/lib/api';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
    isAxiosError: actual.isAxiosError,
  };
});

describe('getApiErrorMessage', () => {
  it('returns error message from axios response data', () => {
    const axiosError = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { data: { error: 'Unauthorized' } },
    });
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(axiosError)).toBe('Unauthorized');
  });

  it('falls back to axios error message when no response data error', () => {
    const axiosError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      response: undefined,
    });
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(axiosError)).toBe('Network Error');
  });

  it('returns message from generic Error', () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    expect(getApiErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong');
  });

  it('returns fallback string for unknown errors', () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    expect(getApiErrorMessage('unknown')).toBe('An unexpected error occurred');
  });

  it('returns fallback when axios response data has no error field', () => {
    const axiosError = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { data: {} },
      message: 'Request failed',
    });
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(axiosError)).toBe('Request failed');
  });
});
