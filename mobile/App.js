import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailsScreen from './src/screens/RestaurantDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrdersHistoryScreen from './src/screens/OrdersHistoryScreen';
import DeliveryDashboardScreen from './src/screens/DeliveryDashboard';
import AssignedOrdersScreen from './src/screens/AssignedOrders';
import EarningsScreen from './src/screens/EarningsScreen';
import useAuthStore from './src/store/authStore';

import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL APP ERROR:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FFF' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E11D48', marginBottom: 10 }}>App Crash Detected</Text>
          <View style={{ backgroundColor: '#F1F5F9', padding: 15, borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#334155' }}>
              {this.state.error?.toString()}
            </Text>
          </View>
          <TouchableOpacity
            style={{ padding: 16, backgroundColor: '#0F172A', borderRadius: 12 }}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold' }}>Restart App</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const Stack = createNativeStackNavigator();

function MainApp() {
  const { loadUser, user } = useAuthStore();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadUser().catch(err => console.error('LoadUser Error:', err));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#FFF', fontSize: 16 }}>Initializing App...</Text>
      </View>
    );
  }

  const initialRoute = user?.role === 'delivery' ? 'DeliveryDashboard' : 'Home';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Delivery Screens */}
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} />
        <Stack.Screen name="AssignedOrders" component={AssignedOrdersScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
