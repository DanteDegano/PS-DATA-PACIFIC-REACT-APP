import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../src/services/api';

export default function HistoryScreen({ route }) {
  const { teamId } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suponiendo que el historial se guarda en una tabla 'team_history'
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('team_history')
        .select('*')
        .eq('team_id', teamId)
        .order('date', { ascending: false });
      if (!error && data) setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [teamId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <ActivityIndicator style={{ marginTop: 40 }} color="#FFD700" />
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <View style={{ width: 340, padding: 24, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#FFD700', textAlign: 'center' }}>Historial de cambios</Text>
        {history.length === 0 ? (
          <Text style={{ color: '#aaa', textAlign: 'center' }}>No hay historial disponible.</Text>
        ) : (
          history.map((h, idx) => (
            <View key={idx} style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#444', paddingBottom: 10 }}>
              <Text style={{ color: '#fff' }}>Fecha: {h.date}</Text>
              <Text style={{ color: '#fff' }}>Nombre: {h.name}</Text>
              <Text style={{ color: '#fff' }}>Emails: {h.emails}</Text>
              <Text style={{ color: '#fff' }}>Jugadores:</Text>
              {h.players && h.players.map((p, i) => (
                <Text key={i} style={{ color: '#fff' }}>{p.name} ({p.number})</Text>
              ))}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
