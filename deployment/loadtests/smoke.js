import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

  const r1 = http.get(`${baseUrl}/healthz`);
  check(r1, { 'healthz 200': (r) => r.status === 200 });

  const r2 = http.post(`${baseUrl}/transactions`, JSON.stringify({ amount: 1 }), {
    headers: { 'content-type': 'application/json' }
  });
  check(r2, { 'transactions 202': (r) => r.status === 202 });

  sleep(0.2);
}
