import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import supabase from '../src/supabaseClient';

export default function TeamDetails({ teamId, onEdit, onBack }) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const { data: teamData } = await supabase.from('teams').select('*').eq('id', teamId).single();
      const { data: emailsData } = await supabase.from('authorized_emails').select('*').eq('team_id', teamId);
      setTeam(teamData);
      // players_data es un JSON en la columna de teams
      let parsedPlayers = [];
      try {
        parsedPlayers = teamData?.players_data ? JSON.parse(teamData.players_data) : [];
      } catch {
        parsedPlayers = [];
      }
      setPlayers(parsedPlayers);
      setEmails(emailsData || []);
      setLoading(false);
    }
    fetchDetails();
  }, [teamId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <Text style={{ color: '#fff', fontSize: 20 }}>Cargando...</Text>
    </View>
  );
  if (!team) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <Text style={{ color: '#fff', fontSize: 20 }}>No se encontró el equipo.</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <ScrollView style={{ width: 340, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, padding: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#fff', textAlign: 'center' }}>Detalles del equipo</Text>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16 }}>Nombre: {team.name}</Text>
        <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Jugadores:</Text>
        {players.length === 0 ? (
          <Text style={{ color: '#aaa' }}>No hay jugadores.</Text>
        ) : (
          <View style={{ marginTop: 8 }}>
            {players.map((p, idx) => (
              <View key={idx} style={{
                backgroundColor: '#23283A',
                borderRadius: 14,
                padding: 18,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {/* Icono de jugador */}
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFD700',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Text style={{ color: '#23283A', fontWeight: 'bold', fontSize: 22 }}>
                    {p.name ? p.name[0].toUpperCase() : '?'}
                  </Text>
                </View>
                {/* Datos del jugador */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginBottom: 2 }}>
                    {p.name || 'Sin nombre'}
                  </Text>
                  {Object.entries(p).map(([key, value]) => (
                    key !== 'name' && (
                      <Text key={key} style={{ color: '#fff', fontSize: 15, marginBottom: 1 }}>
                        <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{key}:</Text> {String(value)}
                      </Text>
                    )
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Emails autorizados:</Text>
        {emails.length === 0 ? <Text style={{ color: '#aaa' }}>No hay emails.</Text> : emails.map(e => (
          <Text key={e.id} style={{ color: '#fff' }}>{e.email}</Text>
        ))}
        <View style={{ marginTop: 18 }}>
          <Button title="Editar equipo" onPress={onEdit} color="#FFD700" />
          <View style={{ height: 8 }} />
          <Button title="Ver historial de cambios" onPress={() => navigation.navigate('HistoryScreen', { teamId: team.id })} color="#2196F3" />
          <View style={{ height: 8 }} />
          <Button title="Volver" onPress={onBack} color="#888" />
        </View>
      </ScrollView>
    </View>
  );
}
