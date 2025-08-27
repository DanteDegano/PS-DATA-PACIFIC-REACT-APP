// Pantalla para el entrenador: subir base de datos y autorizar emails
import { useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { postData } from '../src/services/api';

export default function TrainerScreen({ navigation }) {
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(null);

  const handleAddEmail = () => {
    if (emailInput) {
      setEmails([...emails, emailInput]);
      setEmailInput('');
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // Simulación de subida de datos y generación de URL
      const response = await postData('upload', { emails });
      setUrl(response.url);
    } catch (e) {
      alert('Error al subir datos');
    }
    setUploading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Sube tu base de datos y autoriza emails</Text>
      <TextInput
        placeholder="Email autorizado"
        value={emailInput}
        onChangeText={setEmailInput}
        style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
      />
      <Button title="Agregar Email" onPress={handleAddEmail} />
      <FlatList
        data={emails}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <Button title="Subir datos" onPress={handleSubmit} disabled={uploading} />
      {url && (
        <View style={{ marginTop: 20 }}>
          <Text>Tu URL única:</Text>
          <Text selectable>{url}</Text>
        </View>
      )}
    </View>
  );
}
