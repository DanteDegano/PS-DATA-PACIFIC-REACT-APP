// Pantalla para visualizar datos si el jugador está autorizado
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text } from 'react-native';
import { fetchData } from '../src/services/api';

export default function DataViewScreen({ route }) {
  const { token } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchData(`data/${token}`);
        setData(response);
      } catch (e) {
        setData(null);
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!data) return <Text>No se pudo cargar la data</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Datos del entrenador:</Text>
      {/* Renderiza los datos como desees, aquí un ejemplo simple */}
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  );
}
