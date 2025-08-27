// src/services/api.js
// Módulo para la conexión con el backend API

const BASE_URL = 'https://miapp.com/api'; // Cambia la URL según tu backend

export async function fetchData(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function postData(endpoint, data) {
  return fetchData(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Puedes agregar más funciones según las necesidades del flujo de datos
