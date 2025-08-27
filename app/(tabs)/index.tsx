import { createClient, Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import AuthScreen from '../AuthScreen';
import Home from '../Home';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ?? '';
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  if (!session) return <AuthScreen onAuth={setSession} />;
  return session.user ? <Home /> : null;
}