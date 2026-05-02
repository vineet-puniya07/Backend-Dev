import http from 'k6/http';
import { check } from 'k6';

// Note: 500k req/min ~= 8333 req/s.
// This script is a template; use distributed k6 runners for this scale.

export const options = {
  stages: [
    { duration: '2m', target: 500 },
    { duration: '8m', target: 2500 },
    { duration: '10m', target: 5000 },
    { duration: '5m', target: 1000 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.02']
  }
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const r = http.get(`${baseUrl}/healthz`);
  check(r, { '200': (x) => x.status === 200 });
}
