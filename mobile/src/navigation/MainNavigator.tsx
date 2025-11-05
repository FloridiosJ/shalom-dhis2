import React, {useCallback} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ConsultationScreen from '../screens/ConsultationScreen';
import NewConsultationScreen from '../screens/NewConsultationScreen';
import PatientScreen from '../screens/PatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import ConsultationDetailScreen from '../screens/ConsultationDetailScreen';
import SyncScreen from '../screens/SyncScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const ConsultationStack = createStackNavigator();
const PatientStack = createStackNavigator();

interface MainNavigatorProps {
  onLogout: () => void;
}

// Icon components extracted to avoid re-creation on each render
const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="view-dashboard" color={color} size={size} />
);

const StethoscopeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="stethoscope" color={color} size={size} />
);

const AccountIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="account" color={color} size={size} />
);

const SyncIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="sync" color={color} size={size} />
);

const SettingsIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="cog" color={color} size={size} />
);

// Logout icon component outside render
const LogoutIconButton = ({onPress}: {onPress: () => void}) => (
  <TouchableOpacity onPress={onPress} style={styles.logoutButton}>
    <Icon name="logout" size={24} color="#fff" />
  </TouchableOpacity>
);

// Menu icon component outside render
const MenuIconButton = ({onPress}: {onPress: () => void}) => (
  <TouchableOpacity onPress={onPress} style={styles.menuButton}>
    <Icon name="menu" size={24} color="#fff" />
  </TouchableOpacity>
);

const LOGOUT_ICON_MARGIN = 16;

function ConsultationStackNavigator() {
  return (
    <ConsultationStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <ConsultationStack.Screen
        name="ConsultationList"
        component={ConsultationScreen}
        options={{headerShown: false}}
      />
      <ConsultationStack.Screen
        name="NewConsultation"
        component={NewConsultationScreen}
        options={{
          title: 'Nouvelle Consultation',
          headerBackTitle: 'Retour',
        }}
      />
    </ConsultationStack.Navigator>
  );
}

function PatientStackNavigator() {
  return (
    <PatientStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <PatientStack.Screen
        name="PatientList"
        component={PatientScreen}
        options={{headerShown: false}}
      />
      <PatientStack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{
          title: 'Détails du Patient',
          headerBackTitle: 'Retour',
        }}
      />
      <PatientStack.Screen
        name="ConsultationDetail"
        component={ConsultationDetailScreen}
        options={({route}: any) => ({
          title: `Consultation du ${new Date(
            route.params?.consultation?.dateConsultation,
          ).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}`,
          headerBackTitle: 'Retour',
        })}
      />
    </PatientStack.Navigator>
  );
}

export default function MainNavigator({onLogout}: MainNavigatorProps) {
  const renderLogoutIcon = useCallback(
    () => <LogoutIconButton onPress={onLogout} />,
    [onLogout],
  );

  const handleMenuPress = useCallback(() => {
    // TODO: Open drawer or menu
    console.log('Menu pressed');
  }, []);

  const renderMenuIcon = useCallback(
    () => <MenuIconButton onPress={handleMenuPress} />,
    [handleMenuPress],
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#9E9E9E',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E0E0E0',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: HomeIcon,
            tabBarLabel: 'Accueil',
            headerTitle: 'Shalom Mobile',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Consultation"
          component={ConsultationStackNavigator}
          options={{
            tabBarIcon: StethoscopeIcon,
            tabBarLabel: 'Consultation',
            headerTitle: 'Consultations',
            headerLeft: renderMenuIcon,
            headerRight: renderLogoutIcon,
          }}
        />
        <Tab.Screen
          name="Patient"
          component={PatientStackNavigator}
          options={{
            tabBarIcon: AccountIcon,
            tabBarLabel: 'Patient',
            headerTitle: 'Mes Patients',
            headerRight: renderLogoutIcon,
          }}
        />
        <Tab.Screen
          name="Sync"
          component={SyncScreen}
          options={{
            tabBarIcon: SyncIcon,
            tabBarLabel: 'Sync/Statut',
            headerTitle: 'Synchronisation',
            headerRight: renderLogoutIcon,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: SettingsIcon,
            tabBarLabel: 'Settings',
            headerTitle: 'Paramètres',
            headerRight: renderLogoutIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: LOGOUT_ICON_MARGIN,
    padding: 8,
  },
  menuButton: {
    marginLeft: LOGOUT_ICON_MARGIN,
    padding: 8,
  },
});
