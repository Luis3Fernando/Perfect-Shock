import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function EmailConfirmation({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.circle}></View>
      <FontAwesome name="envelope" size={80} color="#61C6B9" style={{ marginTop: 0 }} />
      <Text style={styles.title}>¡Confirma tu correo!</Text>
      <Text style={styles.presentation}>
        Hemos enviado un enlace de confirmación a tu correo. 
        Por favor, revisa tu bandeja de entrada y confirma tu cuenta para continuar.
      </Text>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={() => navigation.navigate('SingIn')}
      >
        <Text style={styles.submitButtonText}>Ir al Inicio de Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 635,
    height: 635,
    borderRadius: 635 / 2,
    backgroundColor: '#EEFCFB',
    position: 'absolute',
    right: 78, // Cambiado al lado opuesto
    top: -406,
  },
  title: {
    fontSize: 30,
    color: '#61C6B9',
    marginTop: 30,
  },
  presentation: {
    fontSize: 17,
    marginTop: 25,
    color: 'black',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
  },
  submitButton: {
    width: 200,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#61C6B9',
    marginTop: 50,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
