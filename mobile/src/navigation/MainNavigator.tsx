import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ConsultationScreen from '../screens/ConsultationScreen';
import PatientScreen from '../screens/PatientScreen';

const Tab = createBottomTabNavigator();

interface MainNavigatorProps {
  onLogout: () => void;
}

// Icon components extracted to avoid re-creation on each render
const StethoscopeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="stethoscope" color={color} size={size} />
);

const AccountIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="account" color={color} size={size} />
);

// Logout icon component outside render
const LogoutIconButton = ({onPress}: {onPress: () => void}) => (
  <Icon
    name="logout"
    size={24}
    color="#fff"
    style={styles.logoutIcon}
    onPress={onPress}
  />
);

const LOGOUT_ICON_MARGIN = 16;

export default function MainNavigator({onLogout}: MainNavigatorProps) {
  const renderLogoutIcon = useCallback(
    () => <LogoutIconButton onPress={onLogout} />,
    [onLogout],
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#666',
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Tab.Screen
          name="Consultation"
          component={ConsultationScreen}
          options={{
            tabBarIcon: StethoscopeIcon,
            tabBarLabel: 'Consultation',
            headerTitle: 'Consultations',
            headerRight: renderLogoutIcon,
          }}
        />
        <Tab.Screen
          name="Patient"
          component={PatientScreen}
          options={{
            tabBarIcon: AccountIcon,
            tabBarLabel: 'Patient',
            headerTitle: 'Patients',
            headerRight: renderLogoutIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutIcon: {
    marginRight: LOGOUT_ICON_MARGIN,
  },
});
