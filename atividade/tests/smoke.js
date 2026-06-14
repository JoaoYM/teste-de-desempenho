// k6 run tests/smoke.js
// Smoke Test - Verificar se a API está de pé antes de testes pesados

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,          // 1 usuário virtual
  duration: '30s', // Por 30 segundos
  thresholds: {
    http_req_failed: ['rate==0'], // 100% de sucesso obrigatório
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');

  check(res, {
    'status é 200': (r) => r.status === 200,
    'resposta contém UP': (r) => r.json().status === 'UP',
  });
}