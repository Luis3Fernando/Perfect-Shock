import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Emergency({ navigation }: { navigation: any }) {
  // Función para realizar la llamada
  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>EMERGENCIAS</Text>
          <Text style={styles.subtitle}>
            Llama a los siguientes números si necesitas ayuda
          </Text>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          <EmergencyButton
            title="Bomberos"
            phone="084-321025"
            description="Rescate y respuesta inmediata"
            image='fire-truck'
            onPress={() => makeCall('084-321025')}
          />
          <EmergencyButton
            title="Policía"
            phone="083-781644"
            description="Protección y seguridad pública"
            image='police-badge-outline'
            onPress={() => makeCall('083-781644')}
          />
          <EmergencyButton
            title="SAMU"
            phone="083-780041"
            description="Atención médica de emergencia"
            image='hospital-building'
            onPress={() => makeCall('083-780041')}
          />
          <EmergencyButton
            title="COEP"
            phone="982442141"
            description="Coordinación en emergencias"
            image='shield-alert-outline'
            onPress={() => makeCall('982442141')}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const EmergencyButton = ({ title, phone, description, image, onPress }) => (
  <TouchableOpacity
    style={styles.startContainer}
    onPress={onPress}
  >
    <View style={styles.textContainer}>
      <Text style={styles.startText1}>{title}</Text>
      <Text style={styles.startText2}>{phone}</Text>
      <Text style={styles.startText3}>{description}</Text>
    </View>
    <MaterialCommunityIcons name={image} size={50} style={{marginRight: 30}} color="#589A93" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '25%',
    backgroundColor: '#589A93',
    borderBottomRightRadius: 105,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerImage: {
    width: 230,
    height: 420,
    borderBottomRightRadius: 190,
    marginTop: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 0,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    width: '60%'
  },
  iconsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  icon: {
    marginHorizontal: 10,
  },
  content: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    marginTop: -20,
  },
  scrollView: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  startContainer: {
    width: '90%',
    height: 150,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#589A93',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  textContainer: {
    width: '60%',
    alignItems: 'flex-start',
  },
  startText1: {
    color: '#61C6B9',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startText2: {
    color: '#61C6B9',
    fontSize: 22,
    fontWeight: 'bold',
  },
  startText3: {
    color: '#589A93',
    fontSize: 12,
    fontWeight: 'light',
    textAlign: 'left',
  },
  buttonImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight:30
  },
});
