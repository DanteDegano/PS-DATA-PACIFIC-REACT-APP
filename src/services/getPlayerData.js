import supabase from '../supabaseClient';

/**
 * Obtiene los datos de un jugador por su ID
 * @param {string} playerId - ID único del jugador
 * @returns {Promise<Object>} - Datos del jugador
 */
export async function getPlayerData(playerId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) throw error;
  return data;
}
