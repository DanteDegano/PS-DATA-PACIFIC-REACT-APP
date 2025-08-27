import { useNavigation } from '@react-navigation/native';

import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import supabase from '../src/supabaseClient';

function validatePassword(password) {
  // Mínimo 8 caracteres, una mayúscula, un caracter especial
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}


export default function AuthScreen({ onAuth }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    console.log('Intentando registro:', email);
    if (!validatePassword(password)) {
      Alert.alert('La contraseña debe tener al menos 8 caracteres, una mayúscula y un caracter especial.');
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'https://gps-data-pacific-app.vercel.app' }
      });
      if (error) {
        console.log('Error de registro:', error.message);
        Alert.alert('Error', error.message);
      } else {
        console.log('Registro exitoso, email enviado');
        Alert.alert('Registro exitoso', 'Revisa tu email para confirmar el registro.');
        setMode('login');
      }
    } catch (err) {
      console.log('Excepción en registro:', err);
      Alert.alert('Error inesperado', String(err));
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      onAuth && onAuth(data.session);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://gps-data-pacific-app.vercel.app' });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Revisa tu email para cambiar la contraseña.');
      setMode('login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181C24' }}>
      <View style={{ width: 340, padding: 24, borderRadius: 12, backgroundColor: '#222733', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 18, color: '#fff', textAlign: 'center' }}>
          {mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Registrarse' : 'Recuperar contraseña'}
        </Text>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Email:</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }} placeholder="Email" placeholderTextColor="#aaa" />
        {(mode === 'login' || mode === 'signup') && (
          <>
            <Text style={{ color: '#fff', marginBottom: 6 }}>Contraseña:</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }} placeholder="Contraseña" placeholderTextColor="#aaa" />
          </>
        )}
        {mode === 'signup' && (
          <>
            <Text style={{ color: '#fff', marginBottom: 6 }}>Repetir contraseña:</Text>
            <TextInput value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#181C24', color: '#fff', marginBottom: 16, padding: 10, borderRadius: 6 }} placeholder="Repetir contraseña" placeholderTextColor="#aaa" />
          </>
        )}
        {mode === 'login' && (
          <Button title="Iniciar sesión" onPress={handleLogin} disabled={loading} color="#2196F3" />
        )}
        {mode === 'signup' && (
          <Button title="Registrarse" onPress={handleSignup} disabled={loading} color="#2196F3" />
        )}
        {mode === 'reset' && (
          <Button title="Recuperar contraseña" onPress={handleReset} disabled={loading} color="#2196F3" />
        )}
        <View style={{ marginTop: 18 }}>
          {mode === 'login' && (
            <>
              <Button title="¿No tienes cuenta? Regístrate" onPress={() => setMode('signup')} color="#FFD700" />
              <View style={{ height: 8 }} />
              <Button title="¿Olvidaste tu contraseña?" onPress={() => setMode('reset')} color="#FFD700" />
            </>
          )}
          {mode === 'reset' && (
            <Button title="Volver" onPress={() => setMode('login')} color="#FFD700" />
          )}
        </View>
      </View>
    </View>
  );
}
