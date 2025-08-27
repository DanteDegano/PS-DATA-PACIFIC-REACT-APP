import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ?? '';
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function EditTeam({ team, players, emails, onSave, onCancel }) {
  const [name, setName] = useState(team?.name || '');
  const [playerList, setPlayerList] = useState(players);
  const [emailList, setEmailList] = useState(emails.map(e => e.email).join(", "));
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSave = async () => {
    Alert.alert(
      'Confirmar cambios',
      '¿Estás seguro de que quieres guardar los cambios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            if (!name.trim()) {
              Alert.alert('El nombre del equipo no puede estar vacío.');
              return;
            }
            if (playerList.some(p => !p.name.trim() || !p.number)) {
              Alert.alert('Todos los jugadores deben tener nombre y número.');
              return;
            }
            if (emailList && !emailList.split(/[\,\n]+/).every(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim()) || !e.trim())) {
              Alert.alert('Uno o más emails no tienen formato válido.');
              return;
            }
            setLoading(true);
            // Guardar historial en Supabase antes de actualizar
            const historyEntry = {
              team_id: team.id,
              date: new Date().toISOString(),
              name,
              emails: emailList,
              players: playerList.map(p => ({ name: p.name, number: p.number }))
            };
            await supabase.from('team_history').insert([historyEntry]);
            // Actualizar equipo
            const { error: teamError } = await supabase.from('teams').update({ name }).eq('id', team.id);
            if (teamError) {
              Alert.alert('Error al actualizar equipo', teamError.message);
              setLoading(false);
              return;
            }
            // Actualizar emails autorizados
            await supabase.from('authorized_emails').delete().eq('team_id', team.id);
            const emailsToInsert = emailList.split(/[\,\n]+/).map(e => ({ email: e.trim(), team_id: team.id })).filter(e => e.email);
            if (emailsToInsert.length > 0) {
              const { error: emailsError } = await supabase.from('authorized_emails').insert(emailsToInsert);
              if (emailsError) {
                Alert.alert('Error al actualizar emails', emailsError.message);
                setLoading(false);
                return;
              }
            }
            // Actualizar jugadores
            for (const p of playerList) {
              await supabase.from('players').update({ name: p.name, number: p.number }).eq('id', p.id);
            }
            setLoading(false);
            Alert.alert('Equipo actualizado');
            onSave && onSave();
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <View style={{ width: 340, padding: 24, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        {loading && <Text style={{ color: 'blue', marginBottom: 10 }}>Guardando cambios...</Text>}
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#fff', textAlign: 'center' }}>Editar equipo</Text>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Nombre del equipo:</Text>
        <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }} placeholder="Nombre" placeholderTextColor="#aaa" />
        <Text style={{ color: '#fff', marginBottom: 6 }}>Emails autorizados:</Text>
        <TextInput value={emailList} onChangeText={setEmailList} style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }} placeholder="coach@email.com, otro@email.com" placeholderTextColor="#aaa" multiline />
        <Text style={{ marginTop: 10, fontWeight: 'bold', color: '#fff' }}>Jugadores:</Text>
        {playerList.map((p, idx) => (
          <View key={p.id} style={{ marginBottom: 10 }}>
            <Text style={{ color: '#fff' }}>Nombre:</Text>
            <TextInput value={p.name} onChangeText={val => {
              const newList = [...playerList];
              newList[idx].name = val;
              setPlayerList(newList);
            }} style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 5, padding: 8, borderRadius: 6 }} placeholder="Nombre" placeholderTextColor="#aaa" />
            <Text style={{ color: '#fff' }}>Número:</Text>
            <TextInput value={String(p.number)} onChangeText={val => {
              const newList = [...playerList];
              newList[idx].number = val;
              setPlayerList(newList);
            }} style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 5, padding: 8, borderRadius: 6 }} keyboardType="numeric" placeholder="Número" placeholderTextColor="#aaa" />
          </View>
        ))}
        <Button title="Guardar cambios" onPress={handleSave} disabled={loading} color="#2196F3" />
        <View style={{ height: 8 }} />
        <Button title="Cancelar" onPress={onCancel} color="#888" />
        {history.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#FFD700' }}>Historial de cambios:</Text>
            {history.map((h, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#fff' }}>Fecha: {h.date}</Text>
                <Text style={{ color: '#fff' }}>Nombre: {h.name}</Text>
                <Text style={{ color: '#fff' }}>Emails: {h.emails}</Text>
                <Text style={{ color: '#fff' }}>Jugadores:</Text>
                {h.players.map((p, i) => (
                  <Text key={i} style={{ color: '#fff' }}>{p.name} ({p.number})</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
