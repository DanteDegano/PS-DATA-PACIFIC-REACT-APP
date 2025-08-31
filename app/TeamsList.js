import { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { deleteTeam } from '../src/services/deleteTeam';
import supabase from '../src/supabaseClient';
import Papa from 'papaparse';

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      const user = await supabase.auth.getUser();
      const coachId = user?.data?.user?.id;
      if (!coachId) {
        setTeams([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, team_password')
        .eq('coach_id', coachId);
      if (!error) setTeams(data || []);
      setLoading(false);
    }
    fetchTeams();
  }, []);

  const handleDelete = async (teamId) => {
    Alert.alert(
      'Eliminar equipo',
      '¿Estás seguro de que quieres eliminar este equipo y todos sus datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteTeam(teamId);
            if (result.success) {
              setTeams(teams.filter(t => t.id !== teamId));
              Alert.alert('Equipo eliminado');
              setSelectedTeamId(null);
              setEditMode(false);
            } else {
              Alert.alert('Error', result.error?.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  // Sincroniza los datos del equipo desde la URL de Drive
  const handleSync = async (teamId) => {
    setLoading(true);
    try {
      // Verificar sesión de usuario
      const user = await supabase.auth.getUser();
      console.log('Usuario autenticado:', user?.data?.user);
      if (!user?.data?.user) {
        Alert.alert('Error', 'No hay usuario autenticado.');
        setLoading(false);
        return;
      }
      // Obtener la URL de Drive del equipo
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('url_drive_team')
        .eq('id', teamId)
        .single();
      if (teamError || !teamData?.url_drive_team) {
        console.log('Error obteniendo URL Drive:', teamError);
        Alert.alert('Error', 'No se pudo obtener la URL de Drive del equipo.');
        setLoading(false);
        return;
      }
      // Convertir la URL de Google Sheets a formato CSV si es necesario
      let csvUrl = teamData.url_drive_team;
      if (csvUrl.includes('/edit')) {
        // Extraer sheetId y gid
        const match = csvUrl.match(/\/d\/([\w-]+)\/.*[?&]gid=(\d+)/);
        if (match) {
          const sheetId = match[1];
          const gid = match[2];
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        }
      }
      // Descargar el CSV
      const response = await fetch(csvUrl);
      const csvText = await response.text();
  // Mostrar el contenido bruto del CSV descargado
  console.log('CSV descargado (raw):', csvText);
      // Parsear CSV
      const parsed = Papa.parse(csvText, { header: true });
  // Mostrar el contenido parseado del CSV
  console.log('CSV parseado:', parsed.data);
    // Mostrar los headers detectados en el CSV
    console.log('Headers detectados:', Object.keys(parsed.data[0] || {}));
  // Tomar todos los registros del CSV como jugadores
  const csvPlayers = parsed.data.filter(row => Object.values(row).some(v => v));
  console.log('Jugadores CSV:', csvPlayers);
  // Eliminar todos los jugadores existentes del equipo
  const { data: dbPlayers, error: dbError } = await supabase
    .from('players')
    .select('id, team_id')
    .eq('team_id', teamId);
  if (dbError) {
    console.log('Error obteniendo jugadores:', dbError);
    throw dbError;
  }
  const idsToDelete = dbPlayers.map(p => p.id);
  console.log('IDs a borrar:', idsToDelete);
  if (idsToDelete.length > 0) {
    const { error: delError } = await supabase.from('players').delete().in('id', idsToDelete);
    if (delError) console.log('Error borrando jugadores:', delError);
  } else {
    console.log('No hay jugadores para borrar.');
  }
  // Insertar todos los jugadores nuevos
  for (const row of csvPlayers) {
  const playerName = row["Player Name"] || row["player name"] || row["Jugador"] || "Sin nombre";
  console.log('Insertando jugador:', { stats: row, team_id: teamId, name: playerName });
  const { error: insError } = await supabase.from('players').insert({ stats: row, team_id: teamId, name: playerName });
    if (insError) console.log('Error insertando jugador:', insError);
  }
      Alert.alert('Sincronización completa', `Se actualizaron los datos del equipo.`);
    } catch (err) {
      console.log('Error en sincronización:', err);
      Alert.alert('Error', err.message || JSON.stringify(err));
    }
    setLoading(false);
  };

  // Obtener datos del equipo seleccionado
  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <Text style={{ color: '#fff', fontSize: 20 }}>Cargando equipos...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <View style={{ width: 340, padding: 24, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#fff', textAlign: 'center' }}>Mis equipos</Text>
        {teams.length === 0 ? (
          <Text style={{ color: '#aaa', textAlign: 'center' }}>No tienes equipos registrados.</Text>
        ) : (
          teams.map(team => (
            <View key={team.id} style={{ marginBottom: 16, backgroundColor: '#181C24', borderRadius: 8, padding: 12 }}>
              <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16 }}>{team.name}</Text>
              <Text
                style={{ color: '#fff', fontSize: 14, marginBottom: 6 }}
                onPress={() => {
                  if (team.team_password) {
                    // Copiar al portapapeles
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(team.team_password);
                    } else {
                      // React Native Clipboard API
                      import('react-native').then(RN => RN.Clipboard.setString(team.team_password));
                    }
                    Alert.alert('Clave copiada', 'La clave se ha copiado al portapapeles');
                  }
                }}
              >
                Clave: <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{team.team_password || 'Sin clave'}</Text>
                {team.team_password ? <Text style={{ color: '#FFD700' }}> (toca para copiar)</Text> : null}
              </Text>
              <Button title="Eliminar" onPress={() => handleDelete(team.id)} color="#E53935" />
              <View style={{ height: 8 }} />
              <Button title="Sync data" onPress={() => handleSync(team.id)} color="#00BCD4" />
            </View>
          ))
        )}
      </View>
    </View>
  );
}