// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '../../screens/HomeScreen';
import DetailScreen from '../../screens/DetailScreen';
import FavoriteScreen from '../../screens/FavoriteListScreen';

export type RootStackParamList = {
  Home: undefined;
  Details: { id: number };
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#D32F2F' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { color: '#FFFFFF' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Pokédex',
            headerRight: ({ tintColor }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Favorites')}
                style={styles.headerBtn}
                accessibilityLabel="Abrir favoritos"
                accessibilityRole="button"
              >
                <Text style={[styles.headerBtnText, { color: tintColor }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Details"
          component={DetailScreen}
          options={{ title: 'Detalhes' }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoriteScreen}
          options={{ title: 'Favoritos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  headerBtnText: { fontSize: 20, fontWeight: '800' },
});
