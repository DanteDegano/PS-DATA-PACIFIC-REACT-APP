import supabase from '../supabaseClient';

/**
 * Registra un equipo, sus jugadores y emails autorizados en Supabase.
 * @param {Object} team - Datos del equipo (name, coach_id, etc)
 * @param {Array} players - Array de jugadores [{name, number, position, ...}]
 * @param {Array} emails - Array de emails autorizados
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function registerTeam(team, players, emails) {
	// Verificar si el coach existe en la tabla 'coaches'
	const { data: coachData, error: coachError } = await supabase
		.from('coaches')
		.select('id')
		.eq('id', team.coach_id)
		.single();
	if (coachError && coachError.code !== 'PGRST116') return { error: coachError };
	if (!coachData) {
		// Obtener email del usuario autenticado
		const { data: userData } = await supabase.auth.getUser();
	const coachObj = { id: team.coach_id, email: userData?.user?.email, name: team.coach_name };
		const { error: insertCoachError } = await supabase
			.from('coaches')
			.insert([coachObj]);
		if (insertCoachError) return { error: insertCoachError };
	}
	// Guardar los datos de los jugadores en la columna 'players_data' como JSON
	const teamWithPlayers = { ...team, players_data: JSON.stringify(players) };
	const { data: teamData, error: teamError } = await supabase
		.from('teams')
		.insert([teamWithPlayers])
		.select();
	if (teamError) return { error: teamError };
	const teamId = teamData[0]?.id;
	// Insertar emails autorizados
	if (emails && emails.length > 0 && teamId) {
		const emailsWithTeam = emails.map(email => ({ email, team_id: teamId }));
		const { error: emailsError } = await supabase
			.from('authorized_emails')
			.insert(emailsWithTeam);
		if (emailsError) return { error: emailsError };
	}
	return { success: true, teamId };
}
