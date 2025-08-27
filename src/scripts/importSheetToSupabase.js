// src/scripts/importSheetToSupabase.js
// Script para importar el CSV de Google Sheets a Supabase usando la clave service_role


require('dotenv').config();
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');

const GOOGLE_SHEET_URL = process.env.VITE_GOOGLE_SHEET_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


async function importSheet() {
  try {
    // 1. Descargar el CSV usando importación dinámica de node-fetch
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();

    // Mostrar el texto del CSV descargado
    console.log('CSV descargado:\n', csvText);

    // 2. Parsear el CSV
    const { data } = Papa.parse(csvText, { header: true });
    console.log('Datos parseados:', data);

    // Preparar los datos para la columna 'data'
    const rows = data.map(row => ({ data: row }));
    console.log('Filas a insertar:', rows.length);

    // Probar inserción de un solo registro
    if (rows.length > 0) {
      console.log('Intentando insertar el primer registro:', rows[0]);
      const { error, status } = await supabase.from('players').insert([rows[0]]);
      if (error) {
        console.error('Error al insertar el primer registro:', error);
      } else {
        console.log(`Primer registro importado correctamente (${status})`);
      }
    } else {
      console.log('No hay registros para insertar.');
    }

    // 3. Insertar en lotes de 500
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Insertando lote ${i / batchSize + 1}: ${batch.length} registros`);
      const { error, status } = await supabase.from('players').insert(batch);
      if (error) {
        console.error('Error al insertar lote:', error);
      } else {
        console.log(`Lote importado correctamente (${status})`);
      }
    }
  } catch (err) {
    console.error('Error general:', err);
  }
}

importSheet();

// Para ejecutar: node src/scripts/importSheetToSupabase.js
// Asegúrate de tener la clave SUPABASE_SERVICE_ROLE_KEY en tu .env
// Instala dependencias: npm install papaparse node-fetch @supabase/supabase-js dotenv
