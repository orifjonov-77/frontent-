import { request } from './client.js';

export async function register({ full_name, phone }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name, phone }),
  });
}

export async function sendCode(phone) {
  return request(`/auth/send-code?phone=${encodeURIComponent(phone)}`, {
    method: 'POST',
  });
}

export async function login({ phone, code }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}
