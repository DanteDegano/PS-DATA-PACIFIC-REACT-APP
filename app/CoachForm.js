import { useNavigation } from '@react-navigation/native';
import Papa from 'papaparse';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { registerTeam } from '../src/services/registerTeam';
import supabase from '../src/supabaseClient';
import { sheetUrlToCsv } from '../src/utils/sheetUrlToCsv';

export default function CoachForm() {
  const navigation = useNavigation();
  const [teamName, setTeamName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const handleSubmit = async () => {
    const csvUrl = sheetUrlToCsv(sheetUrl);
    if (!csvUrl) {
      alert('La URL de Google Sheet no es válida');
      return;
    }
    if (!coachName) {
      alert('Ingresa el nombre de usuario del entrenador');
      return;
    }
    if (!teamName) {
      alert('Ingresa el nombre del equipo');
      return;
    }
    // Generar contraseña procedural
    function generatePassword(length = 8) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      let pass = '';
      for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pass;
    }
    const teamPassword = generatePassword(8);
    const team = { name: teamName, url_drive_team: sheetUrl, team_password: teamPassword };
    // Verificar si el email del coach ya está registrado
    const user = await supabase.auth.getUser();
    const coachEmail = user.data.user.email;
    const { data: existingCoach, error: coachCheckError } = await supabase
      .from('coaches')
      .select('id')
      .eq('email', coachEmail)
      .single();

    if (existingCoach) {
      team.coach_id = existingCoach.id;
      if (coachName && existingCoach.name !== coachName) {
        await supabase.from('coaches').update({ name: coachName }).eq('id', existingCoach.id);
      }
    } else {
      team.coach_id = user.data.user.id;
      await supabase.from('coaches').insert({ id: user.data.user.id, name: coachName, email: coachEmail });
    }

    // Descargar y parsear jugadores del Google Sheet
    let players = [];
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        alert('No se pudo acceder al archivo. Verifica la URL del Google Sheet.');
        return;
      }
      const csvText = await response.text();
      const { data } = Papa.parse(csvText, { header: true });
      players = data;
    } catch (err) {
      alert('Error al obtener jugadores del sheet: ' + err.message);
      return;
    }

    setConfirmData({ team, players });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!confirmData) return;
    try {
      const user = await supabase.auth.getUser();
      const teamWithCoach = { ...confirmData.team, coach_id: user.data.user.id };
      const result = await registerTeam(teamWithCoach, confirmData.players, []);
      if (result.success) {
        alert('Equipo y jugadores registrados correctamente. ID: ' + result.teamId);
        setTeamName('');
        setSheetUrl('');
        setShowConfirm(false);
        setConfirmData(null);
        navigation.navigate('Home');
      } else {
        alert('Error al registrar: ' + (result.error?.message || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error inesperado: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmData(null);
  };

  if (showConfirm && confirmData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
        <View style={{ width: 380, padding: 32, borderRadius: 18, backgroundColor: '#23283A', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, alignItems: 'center', borderWidth: 2, borderColor: '#FFD700' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 26, marginBottom: 18, color: '#FFD700', textAlign: 'center', letterSpacing: 1, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>Confirmar registro</Text>
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Equipo:</Text>
            <Text style={{ color: '#FFD700', fontSize: 20, marginBottom: 10, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>{confirmData.team.name}</Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>Clave generada:</Text>
            <Text
              style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}
              onPress={() => {
                if (confirmData.team.team_password) {
                  import('react-native').then(RN => RN.Clipboard.setString(confirmData.team.team_password));
                  alert('Clave copiada al portapapeles');
                }
              }}
            >
              {confirmData.team.team_password} <Text style={{ color: '#FFD700' }}>(toca para copiar)</Text>
            </Text>
            <Text style={{ color: '#fff', fontSize: 15, marginTop: 10, marginBottom: 8, textAlign: 'center' }}>
              Puedes volver a ver la clave entrando a <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>Mis equipos</Text>.
            </Text>
          </View>
          <View style={{ width: '100%', marginBottom: 22 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Jugadores:</Text>
            <Text style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>{confirmData.players.length}</Text>
          </View>
          <Button title="CONFIRMAR Y REGISTRAR" onPress={handleConfirm} color="#2196F3" />
          <View style={{ height: 16 }} />
          <Button title="CANCELAR" onPress={handleCancel} color="#E53935" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <View style={{ width: 340, padding: 24, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#fff', textAlign: 'center' }}>Registrar equipo</Text>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Nombre de usuario del entrenador:</Text>
        <TextInput
          value={coachName}
          onChangeText={setCoachName}
          style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }}
          placeholder="Ej: Juan Perez"
          placeholderTextColor="#aaa"
        />
        <Text style={{ color: '#fff', marginBottom: 6 }}>Nombre del equipo:</Text>
        <TextInput
          value={teamName}
          onChangeText={setTeamName}
          style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }}
          placeholder="Ej: Pacific FC"
          placeholderTextColor="#aaa"
        />
        <Text style={{ color: '#fff', marginBottom: 6 }}>URL Google Sheet de jugadores:</Text>
        <TextInput
          value={sheetUrl}
          onChangeText={setSheetUrl}
          style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }}
          placeholder="Pega la URL aquí"
          placeholderTextColor="#aaa"
        />
        <Button title="Registrar equipo" onPress={handleSubmit} color="#2196F3" />
        <View style={{ height: 12 }} />
        <Button title="Ir a Home" onPress={() => navigation.navigate('Home')} color="#FFD700" />
      </View>
    </View>
  );
}