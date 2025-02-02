import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Magnetometer, Gyroscope } from "expo-sensors";
import * as Location from "expo-location";
import Fontisto  from '@expo/vector-icons/Fontisto';

export default function CompassScreen({ route }) {
  const { coordinate } = route.params || { latitude: 0, longitude: 0 };
  
  const [heading, setHeading] = useState(0);
  const [gyroRotation, setGyroRotation] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    let magnetoSubscription, gyroSubscription;

    // 📡 Escuchar cambios del magnetómetro (Norte magnético)
    magnetoSubscription = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setHeading(angle >= 0 ? angle : angle + 360);
    });

    // 🔄 Escuchar cambios del giroscopio (Rotación en Z)
    gyroSubscription = Gyroscope.addListener((data) => {
      const rotationZ = data.z * (180 / Math.PI);
      setGyroRotation(rotationZ);
    });

    // 📍 Obtener la ubicación inicial
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permiso de ubicación denegado.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    };

    getLocation();

    return () => {
      magnetoSubscription && magnetoSubscription.remove();
      gyroSubscription && gyroSubscription.remove();
    };
  }, []);

  // 📍 Calcular el rumbo hacia el destino
  const calculateDirection = () => {
    if (!userLocation || !coordinate) return 0;
    
    const { latitude, longitude } = userLocation;
    
    const φ1 = (latitude * Math.PI) / 180;
    const φ2 = (coordinate.latitude * Math.PI) / 180;
    const λ1 = (longitude * Math.PI) / 180;
    const λ2 = (coordinate.longitude * Math.PI) / 180;
    
    const dLon = λ2 - λ1;
    const y = Math.sin(dLon) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLon);
    const θ = Math.atan2(y, x);
    
    let bearing = (θ * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  const directionToTarget = calculateDirection();

  // 🔄 Ajustar la rotación del icono de la brújula
  const rotation = (directionToTarget - heading - gyroRotation + 360) % 360;
  
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: rotation,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [rotation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Brújula</Text>
      <Animated.View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
        <Fontisto name="compass" size={100} color="red" />
      </Animated.View>
      <Text>Dirección al destino: {Math.round(directionToTarget)}°</Text>
      <Text>Orientación actual: {Math.round(heading)}°</Text>
      <Text>Rotación giroscopio: {Math.round(gyroRotation)}°</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "#000",
    marginVertical: 10,
  },
  arrow: {
    width: 100,
    height: 100,
  },
});
