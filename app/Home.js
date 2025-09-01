import { useNavigation } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

export default function Home() {
  const navigation = useNavigation();

  const pantallas = [
    { name: 'CoachForm', label: 'Registrar equipo', color: '#2196F3' },
    { name: 'TeamsList', label: 'Ver equipos', color: '#FFD700' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#181C24' }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 32 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 18, textAlign: 'center' }}>
        VANTAGE
      </Text>
      {pantallas.map((pantalla, idx) => (
        <TouchableOpacity
          key={pantalla.name}
          onPress={() => navigation.navigate(pantalla.name)}
          style={{
            width: 260,
            backgroundColor: pantalla.color,
            borderRadius: 12,
            paddingVertical: 16,
            marginBottom: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>{pantalla.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Botón de logout */}
      <TouchableOpacity
        onPress={() => {

          navigation.navigate('AuthScreen');
        }}
        style={{
          width: 260,
          backgroundColor: '#D32F2F',
          borderRadius: 12,
          paddingVertical: 16,
          marginBottom: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
