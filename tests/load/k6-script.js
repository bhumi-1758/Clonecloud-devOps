import http from 'k6/http';
import { check, sleep } from 'k6';

// Module F: Load Testing (100, 500, 1000 users)
export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users over 30s
    { duration: '1m', target: 100 },  // Stay at 100 users for 1m
    { duration: '30s', target: 500 }, // Ramp up to 500 users over 30s
    { duration: '1m', target: 500 },  // Stay at 500 users for 1m
    { duration: '30s', target: 1000 },// Ramp up to 1000 users over 30s
    { duration: '1m', target: 1000 }, // Stay at 1000 users for 1m
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

export default function () {
  const url = __ENV.TARGET_URL || 'http://localhost:5000';
  
  const res = http.get(`${url}/tasks`);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'body has tasks array': (r) => r.body.includes('['),
  });
  
  sleep(1);
}
