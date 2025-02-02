import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import CommentItem from '../components/CommentItem'
import {
  Text, StyleSheet, View, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Modal, BackHandler
} from 'react-native'
import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { Place } from '../models/types';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchComments } from '../redux/features/commentsSlice';
import Toast from 'react-native-toast-message';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { likeAPlace, dislikeAPlace, fetchLikeCount, selectLikeCount, fetchHistoryLikes, selectHistoryLikes } from '../redux/features/likesSlice';
import ImageViewer from '../components/ImageViewer'
import { addPlace, removePlace, getPlaces } from '../utils/savePlaces';

export default function PlaceDetail({ navigation }: { navigation: any }) {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state: RootState) => state.comments);
  const [showComments, setShowComments] = useState(false);
  const route = useRoute();
  const { id } = route.params as { id: number };
  const [saved, setSaved] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const likeCount = useSelector(selectLikeCount);
  const [liked, setLiked] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);

  const historyLikes = useSelector(selectHistoryLikes);
  const [loading_liked, setLoadingLiked] = useState(false);
  const place: Place | undefined = useSelector((state: RootState) =>
    state.places.allPlaces.find((p) => p.id === id)
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HomeScreen');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  const openModal = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };


  if (!place) return <Text>Place not found</Text>;

  useEffect(() => {
    dispatch(fetchComments(id));
  }, [dispatch]);

  useEffect(() => {
    const loadCount = async () => {
      try {
        await dispatch(fetchLikeCount(id)).unwrap();
      }
      catch (error) {
        console.error('Error count', error);
      }
    }

    loadCount();
  }, [dispatch])


  useEffect(() => {
    const checkIfSaved = async () => {
      const savedPlaces = await getPlaces();
      if (place && savedPlaces.find((p) => p.id === place.id)) {
        setSaved(true);
      }
    };
    checkIfSaved();
  }, [place]);

  useEffect(() => {
    dispatch(fetchLikeCount(id));
    if (profile) {
      dispatch(fetchHistoryLikes()).then(() => {
        const hasLiked = historyLikes.some((like) => like.id === id);
        setLiked(hasLiked);
        setLoadingScreen(false);
      });
    } else {
      setLoadingScreen(false);
    }
  }, [dispatch, id, profile]);

  const handleLike = async () => {
    if (!profile) {
      Toast.show({
        type: 'info',
        text1: 'Necesitas iniciar sesión',
        text2: 'Debes iniciar sesión para dar like.',
      });
      return;
    }
    setLiked(!liked);
    setLoadingLiked(true);

    try {
      if (liked) {
        await dispatch(dislikeAPlace(id)).unwrap();
        setLiked(false);
      } else {
        await dispatch(likeAPlace(id)).unwrap();
        setLiked(true);
      }
      Toast.show({
        type: 'success',
        text1: liked ? 'Like removido' : 'Like agregado',
        text2: liked ? 'Has removido tu like del lugar.' : 'Has dado like al lugar.',
      });
      dispatch(fetchLikeCount(id));
      dispatch(fetchHistoryLikes());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hubo un problema al procesar tu solicitud.',
      });
    } finally {
      setLoadingLiked(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentPress = () => {
    if (profile) {
      navigation.navigate('Comments', { place: place, user: profile });
    } else {
      Toast.show({ type: 'info', text1: 'Necesitas iniciar sesión', text2: 'Por favor, inicia sesión para comentar', });
    }
  };

  let reorderedComments = [...comments].reverse();

  if (profile) {
    const userComments = reorderedComments.filter(comment => comment.user?.username === profile.user?.username);
    const otherComments = reorderedComments.filter(comment => comment.user?.username !== profile.user?.username);
    reorderedComments = [...userComments, ...otherComments];
  }


  const toggleText = () => {
    setShowFullText(!showFullText);
  };


  const toggleSaved = async () => {
    if (!profile) {
      Toast.show({
        type: 'info',
        text1: 'Necesitas iniciar sesión',
        text2: 'Debes iniciar sesión para guardar lugares.',
      });
      return;
    }
    if (saved) {
      await removePlace(place?.id);
      Toast.show({
        type: 'info',
        text1: 'Lugar eliminado',
        text2: 'Lugar eliminado de guardados.',
      });
    } else {
      await addPlace(place);
      Toast.show({
        type: 'success',
        text1: 'Lugar guardado',
        text2: 'Lugar guardado con éxito.',
      });
    }
    setSaved(!saved);
  };


  if (loadingScreen) {
    return (
      <View style={styles.loadingContainer}> <ActivityIndicator size="large" color="#24BCA9" />
      </View>);
  }

  const seeMap = () => {
    navigation.navigate('Map', {
      coordinate: {
        latitude: `-${place.latitude}`,
        longitude: `-${place.longitude}`,
      },
      targetId: id,
    });
  };

  const seeCompas = () => {
    navigation.navigate('Brujula', {
      coordinate: {
        latitude: `${place.latitude}`,
        longitude: `${place.longitude}`,
      }
    });
  };

  return (
    <>
      <StatusBar hidden={false} style="dark" />
      <View style={{ flex: 1, alignItems: 'center' }}>
        {loading_liked && <ActivityIndicator style={{ position: 'absolute', alignSelf: 'center', top: 30 }} size="large" color="#24BCA9" />}
        {place.photos.length > 0 ? (
          <Image style={styles.cover} source={{ uri: place.photos[0].image }} />
        ) : (
          <Image style={styles.cover} source={require('../assets/img/default_landscape.jpg')}></Image>
        )}
        <View style={styles.container}>
          <TouchableOpacity style={styles.iconContainerSave} onPress={toggleSaved} activeOpacity={1}>
            <Image style={styles.iconSave} source={saved ? require("../assets/icon/marcador_fill.png") : require("../assets/icon/marcador.png")}></Image>
          </TouchableOpacity>
          <View style={styles.content}>
            <Text style={styles.titlePlace}>{place.name}</Text>

            <ScrollView style={styles.description} showsVerticalScrollIndicator={false}>
              <View style={styles.details}>
                <View style={styles.detail}>
                  <Image style={styles.iconDetail} source={require("../assets/icon/ubication.png")}></Image>
                  <Text style={styles.textDetail}>{place.address}</Text>
                </View>
                <TouchableOpacity style={styles.detail} onPress={seeCompas}>
                  <FontAwesome5 name="walking" size={24} color="#C0C0C0"></FontAwesome5>
                  <Text style={styles.textDetail}>Caminar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.details}>
                <View style={styles.detail}>
                  <FontAwesome5 name="heart" size={20} color="#C0C0C0" />
                  <Text style={styles.textDetail}>{likeCount.likes_count}</Text>
                </View>
              </View>

              <Text style={{ width: '100%', flexWrap: 'wrap', lineHeight: 22, textAlign: 'justify', marginTop: 20, alignSelf: 'center' }}>
                {showFullText ? place.description : place.description.slice(0, 150)}
                {place.description.length > 150 && !showFullText && (
                  <TouchableOpacity onPress={toggleText}>
                    <View style={{ alignItems: 'center', marginTop: 5 }}>
                      <Text style={{ color: '#61C6B9' }}> Leer más...</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {place.description.length > 150 && showFullText && (
                  <TouchableOpacity onPress={toggleText}>
                    <View style={{ alignItems: 'center', marginTop: 5 }}>
                      <Text style={{ color: '#61C6B9' }}> Leer menos</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </Text>
              <View style={{ flexDirection: 'row', width: '100%', marginTop: 20 }}>
                <Image style={{ width: 20, height: 20 }} source={require("../assets/icon/picture.png")}></Image>
                <Text style={{ color: '#C0C0C0', marginLeft: 10 }}>
                  Galería
                </Text>
              </View>
              <FlatList
                horizontal={place.photos.length > 1}
                data={place.photos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <>
                    <TouchableOpacity activeOpacity={1} onPress={() => openModal(item.image)}>
                      <Image style={{ width: 200, height: 150, borderRadius: 10, marginRight: 10 }} source={{ uri: item.image }} accessibilityLabel="Imagen" />
                    </TouchableOpacity>
                  </>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row-reverse', marginTop: 20 }}
              />

              <View style={{ flexDirection: 'row', width: '100%', marginTop: 20, marginBottom: 20 }}>
                <FontAwesome name="comments-o" size={22} color="#C0C0C0" />
                <Text style={{ color: '#C0C0C0', marginLeft: 10 }}>
                  Comentarios
                </Text>
                <TouchableOpacity onPress={toggleComments} style={{ marginLeft: 'auto', marginRight: 10 }}>
                  <Text style={{ color: '#61C6B9' }}>{showComments ? 'Ocultar' : 'Mostrar'}</Text>
                </TouchableOpacity>
              </View>

              {showComments &&
                (<FlatList
                  data={reorderedComments}
                  renderItem={({ item }) => <CommentItem comment={item} />}
                  keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Sin comentarios</Text>
                      <Text style={styles.subText}>Sé el primero en comentar</Text>
                    </View>}
                />)}

            </ScrollView>
          </View>
        </View>

        <View style={styles.backButtons}>

        </View>

        <TouchableOpacity
          style={styles.buttonUbication}
          onPress={handleCommentPress}
        >
          <Text style={styles.buttonText}>Comentar</Text>
        </TouchableOpacity>

        <View style={styles.contentsButtonAdd}>

          <TouchableOpacity
            style={[styles.buttonsAdd, { backgroundColor: '#E2E6E6', borderColor: '#33373A' }]}
            onPress={handleLike} >
            {loading_liked ? (<ActivityIndicator size="small" color="#33373A" />) : (<AntDesign name={liked ? "heart" : "hearto"} size={20} color="#33373A" />)}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonsAdd, { backgroundColor: '#E2E6E6', borderColor: '#33373A' }]}
            onPress={seeMap}
          >
            <Ionicons name="compass-sharp" size={20} color="#33373A" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close-circle-sharp" size={50} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: '40%'
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#aaa',
  },
  container: {
    backgroundColor: '#fbfbfb',
    width: '100%',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  content: {
    width: '90%',
    height: '78%',
    marginTop: -100,
  },
  titlePlace: {
    fontSize: 30,
    fontWeight: '400',
    marginTop: 0,
  },
  iconContainerSave: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -25,
    right: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  iconSave: {
    width: 25,
    height: 25
  },
  contentsButtonAdd: {
    position: 'absolute',
    bottom: 10,
    left: 25,
    flexDirection: 'row',
    width: '37%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  details: {
    flexDirection: 'row',
    marginTop: 10,
    width: '90%',
    justifyContent: 'space-between'
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconDetail: {
    width: 20,
    height: 20,
  },
  textDetail: {
    fontSize: 16,
    color: '#C0C0C0',
    marginLeft: 10,
  },
  backButtons: {
    position: 'absolute',
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    bottom: 0,
    opacity: 0.9,
  },

  buttonsAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  buttonUbication: {
    position: 'absolute',
    width: '45%',
    height: 45,
    borderRadius: 30,
    backgroundColor: '#24BCA9',
    bottom: 15,
    right: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white'
  },
  description: {
    width: '100%',
    flexDirection: 'column',
    height: 500,
    marginTop: 20,
  },

  container_comments: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  commentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  commentContent: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentImage: {
    marginTop: 10,
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
  },
  showResponsesText: {
    marginTop: 10,
    color: '#61C6B9',
    fontSize: 14,
  },
  responseContainer: {
    backgroundColor: '#F0F0F0',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
  },
  responseUser: {
    fontWeight: 'bold',
    color: '#61C6B9',
  },

  bottomSheetContent: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    alignSelf: "stretch",
    marginHorizontal: 12,
  },
  sendButton: {
    backgroundColor: '#61C6B9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'black',
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

});
