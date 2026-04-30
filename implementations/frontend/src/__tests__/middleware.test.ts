import { middleware } from '@/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: URL) => ({ _type: 'redirect', href: url.toString() })),
    next: jest.fn(() => ({ _type: 'next' })),
  },
}));

const mockedRedirect = NextResponse.redirect as jest.Mock;
const mockedNext = NextResponse.next as jest.Mock;

function makeRequest(pathname: string, token?: string): NextRequest {
  return {
    nextUrl: new URL(`http://localhost${pathname}`),
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        name === 'auth-token' && token ? { value: token } : undefined,
    },
  } as unknown as NextRequest;
}

describe('middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects unauthenticated user from protected route to login', () => {
    middleware(makeRequest('/dashboard/applicant'));
    expect(mockedRedirect).toHaveBeenCalledTimes(1);
    const url: URL = mockedRedirect.mock.calls[0][0];
    expect(url.pathname).toBe('/auth/login');
  });

  it('includes original path as redirect query param', () => {
    middleware(makeRequest('/dashboard/recruiter/jobs'));
    const url: URL = mockedRedirect.mock.calls[0][0];
    expect(url.searchParams.get('redirect')).toBe('/dashboard/recruiter/jobs');
  });

  it('passes through when authenticated user accesses protected route', () => {
    middleware(makeRequest('/dashboard/applicant', 'valid-token'));
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedNext).toHaveBeenCalledTimes(1);
  });

  it('redirects authenticated user away from login to dashboard', () => {
    middleware(makeRequest('/auth/login', 'valid-token'));
    expect(mockedRedirect).toHaveBeenCalledTimes(1);
    const url: URL = mockedRedirect.mock.calls[0][0];
    expect(url.pathname).toBe('/dashboard/applicant');
  });

  it('redirects authenticated user away from register to dashboard', () => {
    middleware(makeRequest('/auth/register', 'valid-token'));
    expect(mockedRedirect).toHaveBeenCalledTimes(1);
    const url: URL = mockedRedirect.mock.calls[0][0];
    expect(url.pathname).toBe('/dashboard/applicant');
  });

  it('passes through when unauthenticated user accesses auth routes', () => {
    middleware(makeRequest('/auth/login'));
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedNext).toHaveBeenCalledTimes(1);
  });

  it('passes through for routes outside protected and auth prefixes', () => {
    middleware(makeRequest('/'));
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedNext).toHaveBeenCalledTimes(1);
  });

  it('redirects nested protected path to login with correct redirect param', () => {
    middleware(makeRequest('/dashboard/recruiter/jobs/new'));
    const url: URL = mockedRedirect.mock.calls[0][0];
    expect(url.pathname).toBe('/auth/login');
    expect(url.searchParams.get('redirect')).toBe('/dashboard/recruiter/jobs/new');
  });
});
