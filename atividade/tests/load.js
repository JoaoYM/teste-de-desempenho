// k6 run tests/load.js
// Load Test - Simular pico de 50 usuários simultâneos no /checkout/simple

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up: 0 a 50 usuários em 1 minuto
    { duration: '2m', target: 50 },   // Platô: Manter 50 usuários por 2 minutos
    { duration: '30s', target: 0 },   // Ramp-down: 50 a 0 usuários em 30 segundos
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 da latência < 500ms
    http_req_failed: ['rate<0.01'],   // Erros abaixo de 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    produto: 'Notebook',
    quantidade: 1,
    valor: 4999.99,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://localhost:3000/checkout/simple', payload, params);

  check(res, {
    'status é 201': (r) => r.status === 201,
    'transação aprovada': (r) => r.json().status === 'APPROVED',
  });

  sleep(1); // Pacing de 1 segundo entre requisições
}