import supabase from '../supabaseClient';
import Papa from 'papaparse';

/**
 * Descarga y procesa un CSV de stats, creando jugadores en la base de datos
 * @param {string} csvUrl - URL del archivo CSV
 * @param {string} teamId - ID del equipo al que pertenecen los jugadores
 */
export async function importPlayersFromCsv(csvUrl, teamId) {
  // Descarga el CSV
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  // Parsea el CSV
  const parsed = Papa.parse(csvText, { header: true });
  const players = parsed.data;

  // Inserta cada jugador en la tabla players
  for (const player of players) {
    const { name, email, ...stats } = player;
    await supabase.from('players').insert({
      team_id: teamId,
      name,
      email,
      stats
    });
  }
}
