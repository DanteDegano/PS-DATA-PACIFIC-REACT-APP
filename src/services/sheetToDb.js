// src/services/sheetToDb.js
// Descarga el CSV de Google Sheets, lo parsea y lo guarda en la base de datos (ejemplo: Supabase)

import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const GOOGLE_SHEET_URL = process.env.VITE_GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/1dWUAMAxqqhWMxyVADcqU6cOPWPEc8Tjyt9v5Iq7OPbA/export?format=csv';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchAndSaveSheetData() {
  // 1. Descargar el CSV
  const response = await fetch(GOOGLE_SHEET_URL);
  const csvText = await response.text();

  // 2. Parsear el CSV
  const { data } = Papa.parse(csvText, { header: true });

  // 3. Guardar los datos en la base de datos
  // Suponiendo que tienes una tabla 'players' en Supabase
  const { error } = await supabase.from('players').insert(data);
  if (error) throw error;
  return data;
}

// Nota: Instala las dependencias necesarias:
// npm install papaparse @supabase/supabase-js
