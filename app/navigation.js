import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './AuthScreen';
import CoachForm from './CoachForm';
import DataViewScreen from './DataViewScreen';
import EditTeam from './EditTeam';
import HistoryScreen from './HistoryScreen';
import Home from './Home';
import PlayerAccessScreen from './PlayerAccessScreen';
import TeamDetails from './TeamDetails';
import TeamsList from './TeamsList';
import TrainerScreen from './TrainerScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CoachForm" component={CoachForm} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="DataViewScreen" component={DataViewScreen} />
        <Stack.Screen name="EditTeam" component={EditTeam} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        <Stack.Screen name="PlayerAccessScreen" component={PlayerAccessScreen} />
        <Stack.Screen name="TeamDetails" component={TeamDetails} />
        <Stack.Screen name="TeamsList" component={TeamsList} />
        <Stack.Screen name="TrainerScreen" component={TrainerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
