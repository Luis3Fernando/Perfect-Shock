import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, TextInput, SafeAreaView } from 'react-native';
import { Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getPlaces } from '../redux/features/placesSlice';
import { getEvents } from '../redux/features/eventsSlice';
import { AppDispatch, RootState } from '../redux/store';
import { StatusBar } from 'expo-status-bar';
import { Place, Event } from '../models/types';
import { colors } from '../constants/colors';
import { getEventParticipationCount } from '../redux/features/eventsSlice';
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import { selectTouristPlaces } from '../redux/features/placesSlice';
import { fetchMostVisitedPlaces } from '../redux/features/visitSlice'
import Toast from 'react-native-toast-message';

export default function Home({ navigation }: { navigation: any }) {
  const profile = useSelector((state: RootState) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('eventos');
  const [randomPlaces, setRandomPlaces] = useState<Place[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading_places, error } = useSelector((state: RootState) => state.places);
  const places = useSelector(selectTouristPlaces);
  const mostVisited = useSelector((state: RootState) => state.visit.mostVisited);
  const statusMostVisited = useSelector((state: RootState) => state.visit.status);
  const [isLoaded, setIsLoaded] = useState(false);
  const { events, isLoading: eventsLoading, error: eventsError, participationCounts } = useSelector(
    (state: RootState) => state.events
  );

  const [filteredContent, setFilteredContent] = useState<(Place | Event)[]>(events);

  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    navigation.navigate("Search", { query: searchText });
  };

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchMostVisitedPlaces());
      setIsLoaded(true);
    };
    fetchData();
  }, [dispatch])

  useEffect(() => {
    dispatch(getPlaces());
    dispatch(getEvents());
  }, [dispatch]);

  useEffect(() => {
    if (events.length > 0) {
      events.forEach((event) => {
        if (participationCounts[event.id] === undefined) {
          dispatch(getEventParticipationCount(event.id));
        }
      });
    }
  }, [dispatch, events, participationCounts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedContent = filterContent(selectedCategory);
      setFilteredContent(updatedContent);
    }, 10);
    setIsLoading(false);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  useEffect(() => {
    if (events.length > 0) {
      setFilteredContent(events);
      setIsLoading(false);
    }
  }, [events]);

  useEffect(() => {
    if (places.length > 0) {
      getRandomPlaces();
    }
  }, [places]);

  const getRandomPlaces = () => {
    if (places.length > 0) {
      const shuffledPlaces = [...places].sort(() => 0.5 - Math.random());
      const selectedPlaces = shuffledPlaces.slice(0, 5);
      setRandomPlaces(selectedPlaces);
    }
  };

  const filterContent = (selectedCategory: string,) => {
    if (selectedCategory === 'eventos') {
      return events;
    } else {
      return places.filter(place => place.category.name === selectedCategory).reverse();
    }
  };

  const seePlace = (item: Place) => {
    navigation.navigate('Place', { id: item.id });
  };

  const seeEvent = (item: Event) => {
    navigation.navigate('Events', { id: item.id });
  };

  const seeNotification = () => {
    if(!profile){
       Toast.show({ type: 'info', text1: 'Necesitas iniciar sesión', text2: 'Por favor, inicia sesión para ver las notificaciones', });
    }else{
      navigation.navigate('Notifications')
    }
    
  };

  const formatEventDate = (eventDateString: string): string => {
    const eventDate = new Date(eventDateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir la diferencia de tiempo a días

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Mañana';
    } else if (diffDays === 2) {
      return 'En 2 días';
    } else if (diffDays === 3) {
      return 'En 3 días';
    } else {
      return eventDate.toLocaleDateString(); // Formato de fecha normal para otras fechas
    }
  };

  if (!isLoaded || statusMostVisited === 'loading' || isLoading_places || eventsLoading) {
    return (
      <View style={styles.loadingContainer}> <ActivityIndicator size="large" color="#24BCA9" /></View>);
  } if (statusMostVisited === 'failed' || isLoading_places || eventsError) {
    return (
      <View style={styles.errorContainer}> <Text>Error cargando los lugares más visitados. Intenta de nuevo más tarde.</Text> </View>
    );
  }


  const renderItem = ({ item }: { item: any }) => {
    const isEventosCategory = selectedCategory === 'eventos';
    const participationCount = participationCounts[item.id];
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={1}
        onPress={() => {
          isEventosCategory ? seeEvent(item) : seePlace(item);
        }}
      >
        {isEventosCategory ? (
          <>
            <View style={{ flex: 1 }}>
              <Image style={styles.itemImage} source={{ uri: item.banner_image }} />
              <Text style={{ fontSize: 16, color: 'black', width: '60%', marginLeft: 15, marginTop: 10 }}>
                {item.name}
              </Text>

              <View
                style={{
                  position: 'absolute',
                  padding: 10,
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 10,
                  bottom: 10,
                  right: 10,
                }}
              >
                <AntDesign name="calendar" size={20} style={{ marginRight: 10 }} color={colors.primary} />
                <Text style={{ color: '#24BCA9', fontSize: 12 }}>{item?.event_date && formatEventDate(item.event_date)}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={{ flex: 1 }}>
              {item.photos && item.photos.length > 0 ? (
                <Image style={styles.itemImage} source={{ uri: item.photos[0].image }} />
              ) : (
                <View style={[styles.itemImage, { backgroundColor: '#EEEEEE' }]} ></View>
              )}
              <Text style={{ fontSize: 16, color: 'black', width: '60%', marginLeft: 15, marginTop: 10 }}>
                {item.name}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  padding: 10,
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 10,
                  bottom: 10,
                  right: 10,
                }}
              >
                <Image style={{ width: 20, height: 20, marginRight: 10 }} source={require("../assets/icon/gallery_fill.png")} />
                {item.photos && item.photos.length > 0 ? (
                  <Text style={{ color: '#24BCA9', fontSize: 12 }}>{item.photos.length}</Text>
                ) : (
                  <Text style={{ color: '#24BCA9', fontSize: 12 }}>0</Text>
                )}
              </View>
            </View>

          </>
        )}
      </TouchableOpacity>
    );
  };

  


  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <StatusBar hidden={false} style="light" backgroundColor='#24BCA9' />
      <View style={styles.header}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            {profile?.profile_img ? (
              <Image style={styles.userBack} source={{ uri: `https://bapugoapi.jhedgost.com${profile.profile_img}` }} />
            ) : (
              <View style={styles.userBack}>
                <Image
                  style={styles.userImage1}
                  source={require('../assets/icon/usuario.png')}
                />
              </View>
            )}
            <Text style={styles.userName}>
              {profile ? `Hola ${profile.user.first_name}` : 'Hola'}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={1} style={styles.notificationContainer} onPress={seeNotification}>
            <Image style={styles.notificationIcon} source={require("../assets/icon/campana.png")}></Image>
          </TouchableOpacity>
        </View>


        <View style={styles.titleContainer}>
          <Text style={styles.title}>Explora</Text>
        </View>

        <View>
          <View style={styles.search2}>
            <TouchableOpacity onPress={handleSearch}>
              <Icon source="magnify" size={35} color="#24BCA9" />
            </TouchableOpacity>
            <TextInput
              placeholder="Buscar"
              style={{
                height: "100%",
                width: "82%",
                borderRadius: 15,
                paddingHorizontal: 10,
              }}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch} // Cuando confirmen desde el teclado
            />
          </View>
        </View>

      </View>

      <ScrollView style={styles.containerMain} showsVerticalScrollIndicator={false}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
          <View style={styles.categories}>
            {['eventos', 'popular', 'top', 'nuevo'].map(category => (
              <Text
                key={category}
                style={[styles.category, selectedCategory === category && styles.selectedCategory]}
                onPress={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            ))}
          </View>
        </ScrollView>

        <FlatList
          horizontal
          data={filteredContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
        />


        <Text style={styles.titleMain}>Lugares mas visitados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.containerHorizontal}>
          {mostVisited.map((place, index) => (
            <TouchableOpacity key={index} style={styles.card_mini} activeOpacity={1} onPress={() => seePlace(place)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image style={{ width: 50, height: 50 }} source={require("../assets/icon/icon_nature_1.png")}></Image>
                <Text style={[styles.cardTitle, { width: '60%', fontSize: 15, marginLeft: 15 }]}>{place.name}</Text>
              </View>
              <Image style={{ width: 28, height: 28 }} source={require("../assets/icon/caminando.png")}></Image>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.titleMain}>Lugares Recomendados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.containerHorizontal}>
          {randomPlaces.map((place, index) => (
            <TouchableOpacity key={index} style={styles.card} activeOpacity={1} onPress={() => seePlace(place)}>

              {place.photos.length > 0 ? (
                <Image style={styles.itemImage} source={{ uri: place.photos[0].image }} />
              ) : (
                <Image style={styles.cardImage} source={require('../assets/img/default_landscape.jpg')}></Image>
              )}
              <Text style={styles.cardTitle}>{place.name}</Text>
              <View style={styles.containerUbi}>
                <Image style={styles.iconUbicacion} source={require("../assets/icon/ubication.png")}></Image>
                <Text style={styles.textUbicacion}>{place.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.titleMain}>Descubre</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.containerHorizontal}>
          {places.map((place, index) => (
            <TouchableOpacity key={index} style={styles.card} activeOpacity={1} onPress={() => seePlace(place)}>
              {place.photos.length > 0 ? (
                <Image style={styles.itemImage} source={{ uri: place.photos[0].image }} />
              ) : (
                <Image style={styles.itemImage} source={require('../assets/img/default_landscape.jpg')}></Image>
              )}
              <Text style={styles.cardTitle}>{place.name}</Text>
              <View style={styles.containerUbi}>
                <Image style={styles.iconUbicacion} source={require("../assets/icon/ubication.png")}></Image>
                <Text style={styles.textUbicacion}>{place.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
    backgroundColor: '#24BCA9',
    paddingHorizontal: '5%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 40,
  },
  search2: {
    width: '90%',
    flexDirection: 'row',
    display: 'flex',
    borderRadius: 10,
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 20,
    marginLeft: 15
  },
  userBack: {
    backgroundColor: '#1D9A8A',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userImage1: {
    width: 25,
    height: 25,
  },
  userName: {
    fontSize: 16,
    marginLeft: 15,
    color: 'white'
  },
  title: {
    color: 'white',
    fontSize: 28,
    marginTop: 5,
    marginLeft: 10,
    textAlign: 'left'
  },
  titleContainer: {
    marginTop: 5,
    width: '90%',
  },
  containerMain: {
    width: '90%',
    height: 'auto',
    marginTop: 10,
    marginBottom: 10,
  },
  titleMain: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    marginTop: 15
  },
  containerHorizontal: {
    width: '100%',
    marginTop: 10

  },
  card: {
    width: 200,
    height: 300,
    marginLeft: 20,
    borderRadius: 5,
    backgroundColor: 'white',
    overflow: 'hidden'
  },

  card_mini: {
    width: 320,
    height: 90,
    marginLeft: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  cardImage: {
    width: '100%',
    height: '70%',
    objectFit: 'cover'
  },
  cardTitle: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 15,
  },
  iconUbicacion: {
    width: 15,
    height: 15,
    marginLeft: 10,
  },
  containerUbi: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  textUbicacion: {
    marginLeft: 10,
    color: '#C0C0C0',
    fontSize: 15,
    fontWeight: '300'
  },
  categories: {
    flexDirection: 'row',
    padding: 10,
  },
  category: {
    marginRight: 15,
    fontSize: 16,
    color: '#C0C0C0',
  },
  selectedCategory: {
    color: 'black',
    fontWeight: '600',
  },
  item: {
    width: 300,
    height: 250,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  itemImage: {
    height: '75%',
    width: '100%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  coverShadow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  notificationContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  notificationIcon: {
    width: 25,
    height: 25,
  },
  pointBack: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    right: '23%',
    top: '30%'
  },
  point: {
    width: 6,
    height: 6,
    backgroundColor: '#61C6B9',
    borderRadius: 3,
    position: 'absolute',
    top: 1.5,
    left: 1.5
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  visitsCount: {
    fontSize: 16,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
})
