import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { Event } from '../models/types';
import { RootState, AppDispatch } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import { getEventParticipationCount } from '../redux/features/eventsSlice';
import { fetchUserEventStatus, createOrUpdateUserEventStatus, resetState } from '../redux/features/userEventsSlice';

export default function Events() {
  const profile = useSelector((state: RootState) => state.profile);
  const route = useRoute();
  const [localParticipationCount, setLocalParticipationCount] = useState(0);
  const { id } = route.params as { id: number };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { status, loading, error } = useSelector((state: RootState) => state.userEvent)
  const { participationCounts } = useSelector(
    (state: RootState) => state.events
  );
  const event: Event | undefined = useSelector((state: RootState) =>
    state.events.events.find((p) => p.id === id)
  );

  useEffect(() => {
    dispatch(fetchUserEventStatus(event?.id)); return () => {
      dispatch(resetState());
    };
  }, [dispatch, event?.id]);

  const snapPoints = useMemo(() => ['50%', '100%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    if (event?.id) {
      setLocalParticipationCount(participationCounts[event.id] || 0);
      dispatch(getEventParticipationCount(event.id));
    }
  }, [dispatch, event?.id, participationCounts]);


  const handleParticipationPress = () => {
    const newStatus = status ? 'no_interesado' : 'interesado';
    const newCount = status ? localParticipationCount - 1 : localParticipationCount + 1;
    setLocalParticipationCount(newCount);

    dispatch(createOrUpdateUserEventStatus({ id_event: event?.id, status: newStatus }))
      .then(() => { dispatch(getEventParticipationCount(event.id)); });
  };

  const buttonText = status === true ? 'No me interesa' : 'Me interesa';

  return (
    <>
      <StatusBar hidden={false} style="light" backgroundColor={event?.color_enfasis} />
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={{ uri: event?.detail_image }}
          style={styles.imagenPortada}
        />

        <TouchableOpacity
          onPress={handlePresentModalPress}
          style={[styles.button, { backgroundColor: event?.color_enfasis }]}
        >
          <MaterialIcons name="keyboard-arrow-up" size={40} color="white" />

        </TouchableOpacity>

        <Text style={[styles.title, { marginTop: 10, color: event?.color_enfasis }]}>{event?.name}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '70%', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <FontAwesome5 name="calendar-alt" size={26} color="#9D9D9D" />
            <Text style={{ marginLeft: 10, fontSize: 15, color: "#9D9D9D" }}>{event?.event_date && new Date(event.event_date).toLocaleDateString()}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Entypo name="location" size={26} color="#9D9D9D" />
            <Text style={{ marginLeft: 10, fontSize: 15, color: "#9D9D9D" }}>{event?.ubication}</Text>
          </View>
        </View>

        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            style={styles.modalStyle}
          >
            <BottomSheetView style={styles.contentContainer}>
              <Text style={[styles.title, { color: event?.color_enfasis }]}>{event?.name}</Text>
              {
                event?.slogan && (
                  <Text style={[styles.slogan, { color: event?.color_enfasis }]}>{event?.slogan}</Text>
                )
              }
              <View style={styles.infoRow}>
                <Feather name="calendar" size={20} color={event?.color_enfasis} />
                <Text style={[styles.infoText, { color: event?.color_enfasis }]}>Fecha: {event?.event_date && new Date(event.event_date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Entypo name="location" size={20} color={event?.color_enfasis} />
                <Text style={[styles.infoText, { color: event?.color_enfasis }]}>Ubicación: {event?.ubication}</Text>
              </View>

              <View style={styles.infoRow}>
                <Fontisto name="persons" size={20} color={event?.color_enfasis} />
                <Text style={[styles.infoText, { color: event?.color_enfasis }]}>
                  Interesados: {localParticipationCount}
                </Text>
              </View>
              <ScrollView style={styles.scrollContainer}>
                <Text style={styles.description}>
                  {event?.description}
                </Text>
                <Image
                  style={styles.bannerImage}
                  source={{ uri: event?.thumbnail_image }}
                />
              </ScrollView>

              {profile ?
                (

                  <TouchableOpacity
                    style={[styles.buttonUbication, { backgroundColor: event?.color_enfasis }]}
                    disabled={loading}
                    onPress={handleParticipationPress}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>{buttonText}</Text>
                    )}
                  </TouchableOpacity>
                ) : null}


            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
  buttonText: {
    fontSize: 18,
    color: 'white'
  },
  buttonUbication: {
    position: 'absolute',
    width: '45%',
    height: 45,
    borderRadius: 30,
    backgroundColor: '#24BCA9',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  imagenPortada: {
    width: '100%',
    height: '80%',
    marginTop: -60
  },
  button: {
    marginTop: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  slogan: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 10,
    marginBottom: 30
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '400',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'justify',
    marginTop: 20,
  },
  bannerImage: {
    width: '80%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10,
    alignSelf: 'center'
  },
  scrollContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalStyle: {
    zIndex: 10,
    elevation: 10,
  },
});