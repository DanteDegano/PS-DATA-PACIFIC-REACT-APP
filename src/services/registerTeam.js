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
		// Si el coach no existe, lo creamos
		const { data: userData } = await supabase.auth.getUser();
		const coachObj = { 
			id: team.coach_id, 
			email: userData?.user?.email, 
			name: team.coach_name || userData?.user?.email // fallback al email si no hay nombre
		};
		const { error: insertCoachError } = await supabase
			.from('coaches')
			.insert([coachObj]);
		if (insertCoachError) return { error: insertCoachError };
	}
	// Si el coach ya existe, simplemente asociamos el equipo con su id y continuamos
	// Insertar el equipo sin la columna 'players_data'
	const { data: teamData, error: teamError } = await supabase
		.from('teams')
		.insert([team])
		.select();
	if (teamError) return { error: teamError };
	const teamId = teamData[0]?.id;
	// Insertar emails autorizados evitando duplicados
	if (emails && emails.length > 0 && teamId) {
		const { data: existingEmails } = await supabase
			.from('authorized_emails')
			.select('email')
			.in('email', emails)
			.eq('team_id', teamId);
		const newEmails = emails.filter(email => !existingEmails?.some(e => e.email === email));
		if (newEmails.length > 0) {
			const emailsWithTeam = newEmails.map(email => ({ email, team_id: teamId }));
			const { error: emailsError } = await supabase
				.from('authorized_emails')
				.insert(emailsWithTeam);
			if (emailsError) return { error: emailsError };
		}
	}
	// Insertar jugadores en la tabla 'players'
	if (players && players.length > 0 && teamId) {
		const playersWithTeam = players.map(player => ({
			team_id: teamId,
			name: player["Player Name"] || 'Sin nombre',
			email: player.email,
			stats: Object.fromEntries(Object.entries(player).filter(([key]) => key !== 'name' && key !== 'email'))
		}));
		const { error: playersError } = await supabase
			.from('players')
			.insert(playersWithTeam);
		if (playersError) return { error: playersError };
	}
	return { success: true, teamId };
}
