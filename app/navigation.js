import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './AuthScreen';
import CoachForm from './CoachForm';
import Home from './Home';
import PlayerAccessScreen from './PlayerAccessScreen';
import TeamsList from './TeamsList';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CoachForm" component={CoachForm} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="PlayerAccessScreen" component={PlayerAccessScreen} />
        <Stack.Screen name="TeamsList" component={TeamsList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
