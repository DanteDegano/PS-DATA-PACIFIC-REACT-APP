// Pantalla para el jugador: ingresar email y token
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { postData } from '../src/services/api';

export default function PlayerAccessScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [authorized, setAuthorized] = useState(null);

  const handleAccess = async () => {
    try {
      const response = await postData('validate', { email, token });
      setAuthorized(response.authorized);
      if (response.authorized) {
        navigation.navigate('DataViewScreen', { token });
      }
    } catch (e) {
      alert('Error de validación');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Acceso de jugador</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
      />
      <TextInput
        placeholder="Token"
        value={token}
        onChangeText={setToken}
        style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
      />
      <Button title="Acceder" onPress={handleAccess} />
      {authorized === false && <Text>Acceso denegado</Text>}
    </View>
  );
}
