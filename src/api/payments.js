import { request } from './client.js';

export async function initPayment({ course_id, provider = 'payme' }) {
  return request('/payments/init', {
    method: 'POST',
    body: JSON.stringify({ course_id, provider }),
  });
}
