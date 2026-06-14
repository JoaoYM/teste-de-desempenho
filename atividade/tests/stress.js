// k6 run tests/stress.js
// Stress Test - Encontrar o ponto de ruptura no /checkout/crypto (CPU Bound)

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 200 },   // 0 a 200 usuários em 2 minutos
    { duration: '2m', target: 500 },   // 200 a 500 usuários em 2 minutos
    { duration: '2m', target: 1000 },  // 500 a 1000 usuários em 2 minutos
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // Threshold brando para observar degradação
    http_req_failed: ['rate<0.10'],     // Até 10% de erro para observar o breaking point
  },
};

export default function () {
  const payload = JSON.stringify({
    cartao: '4111111111111111',
    cvv: '123',
    valor: 250.00,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://localhost:3000/checkout/crypto', payload, params);

  check(res, {
    'status é 201': (r) => r.status === 201,
    'transação segura': (r) => r.json().status === 'SECURE_TRANSACTION',
  });

  sleep(1);
}