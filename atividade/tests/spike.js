// k6 run tests/spike.js
// Spike Test - Simular flash sale no /checkout/simple

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Carga baixa: 10 usuários por 30s
    { duration: '10s', target: 300 },  // Salto imediato para 300 usuários em 10s
    { duration: '1m', target: 300 },   // Manter 300 usuários por 1 minuto
    { duration: '10s', target: 10 },   // Queda imediata para 10 usuários
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Tolerância maior para o pico
    http_req_failed: ['rate<0.05'],    // Máximo 5% de erros
  },
};

export default function () {
  const payload = JSON.stringify({
    produto: 'Ingresso Show',
    quantidade: 2,
    valor: 299.90,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://localhost:3000/checkout/simple', payload, params);

  check(res, {
    'status é 201': (r) => r.status === 201,
    'transação aprovada': (r) => r.json().status === 'APPROVED',
  });

  sleep(0.5); // Pacing menor durante o pico
}