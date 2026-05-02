import http from 'k6/http';
import { check } from 'k6';

// Note: 100k req/min ~= 1667 req/s.
// This script is a template; tune VUs/stages for your app and Heroku limits.

export const options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '5m', target: 800 },
    { duration: '5m', target: 1200 },
    { duration: '2m', target: 200 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  const r = http.get(`${baseUrl}/healthz`);
  check(r, { '200': (x) => x.status === 200 });
}
