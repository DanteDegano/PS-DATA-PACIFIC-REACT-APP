import { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { deleteTeam } from '../src/services/deleteTeam';
import supabase from '../src/supabaseClient';
import EditTeam from './EditTeam';
import TeamDetails from './TeamDetails';



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
        .select('id, name')
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
              <Button title="Ver detalles" onPress={() => { setSelectedTeamId(team.id); setEditMode(false); }} color="#2196F3" />
              <View style={{ height: 8 }} />
              <Button title="Editar" onPress={() => { setSelectedTeamId(team.id); setEditMode(true); }} color="#FFD700" />
              <View style={{ height: 8 }} />
              <Button title="Eliminar" onPress={() => handleDelete(team.id)} color="#E53935" />
            </View>
          ))
        )}
        {selectedTeamId && !editMode && (
          <TeamDetails teamId={selectedTeamId} onEdit={() => setEditMode(true)} onBack={() => { setSelectedTeamId(null); setEditMode(false); }} />
        )}
        {selectedTeamId && editMode && (
          <EditTeam team={selectedTeam} players={[]} emails={[]} onSave={() => { setEditMode(false); }} onCancel={() => setEditMode(false)} />
        )}
      </View>
    </View>
  );
}
