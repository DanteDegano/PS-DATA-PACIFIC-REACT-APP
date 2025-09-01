import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || Constants.manifest?.extra?.SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_KEY || Constants.manifest?.extra?.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Elimina un equipo y sus datos asociados (jugadores, emails autorizados) en Supabase.
 * @param {number} teamId - ID del equipo a eliminar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function deleteTeam(teamId) {
  // Eliminar jugadores asociados
  const { error: playersError } = await supabase
    .from('players')
    .delete()
    .eq('team_id', teamId);
  if (playersError) return { error: playersError };

  // Eliminada lógica de emails autorizados

  // Eliminar el equipo
  const { error: teamError } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);
  if (teamError) return { error: teamError };

  return { success: true };
}
