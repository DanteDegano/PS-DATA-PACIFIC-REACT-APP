import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import TeamDashboard from '../components/TeamDashboard';
import TeamRanking from '../components/TeamRanking';
import supabase from '../src/supabaseClient';
import { useRoute } from '@react-navigation/native';

export default function TeamDashboardScreen() {
  const route = useRoute();
  const { teamId, teamName } = route.params || {};
  if (!teamId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>No se recibió el equipo seleccionado.</Text>
      </View>
    );
  }
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('stats')
        .eq('team_id', teamId);
      if (!error && data) {
        setPlayers(data.map(p => p.stats));
      } else {
        setPlayers([]);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, [teamId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <Text style={{ color: '#fff', fontSize: 20 }}>Cargando dashboard...</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#181C24' }} contentContainerStyle={{ alignItems: 'center', padding: 24 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#FFD700', textAlign: 'center' }}>Dashboard de {teamName}</Text>
  <TeamDashboard players={players} />
  <TeamRanking rawData={players} />
    </ScrollView>
  );
}
