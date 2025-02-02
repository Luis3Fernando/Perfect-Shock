import { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import Ionicons from '@expo/vector-icons/Ionicons';

import { RootState, AppDispatch } from '../redux/store';
import { deleteExistingComment } from '../redux/features/commentsSlice';


interface Comment {
  id: number;
  user: {
    username: string;
    profile_img: string | null;
  };
  content: string;
  created_at: string;
  images: { image: string }[];
}

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await dispatch(deleteExistingComment({ commentId: id })).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Comentario eliminado',
        text2: 'El comentario se eliminó correctamente',
      });
    } catch (error) {
      console.error(`Error eliminando comentario con ID ${id}:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo eliminar el comentario',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.userContainer}>

        {
          comment.user && comment.user.profile_img ? (
            <Image
              style={styles.userBack}
              source={
                comment.user && comment.user.profile_img
                  ? { uri: `https://bapugoapi.jhedgost.com${comment.user.profile_img}` }
                  : require("../assets/icon/usuario.png")
              }
            />
          ) : (
            <View style={styles.userBack}>
              <Image
                style={styles.profileImage}
                source={require("../assets/icon/usuario.png")
                }
              />
            </View>
          )
        }

        <Text style={styles.username}>
          {comment.user ? comment.user.username : 'Usuario desconocido'}
        </Text>
      </View>


      {/* Contenido del comentario */}
      <Text style={styles.commentContent}>{comment.content}</Text>

      {/* Carrusel de imágenes */}
      {comment.images?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        >
          {comment.images.map((img, index) => (
            <TouchableOpacity key={index} style={styles.imageContainer} onPress={() => openModal(`https://bapugoapi.jhedgost.com${img.image}`)}>
              <Image style={styles.commentImage} source={{ uri: `https://bapugoapi.jhedgost.com${img.image}` }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}


      {/* Fecha */}
      <Text style={styles.date}>
        {formatDate(comment?.created_at)}
      </Text>

      {/* Botón de eliminar comentario (solo para el usuario actual) */}
      {profile && comment?.user?.username === profile.user.username && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteComment(comment.id)}
        >
          <Ionicons name="trash-bin-outline" size={20} color="gray" />
        </TouchableOpacity>
      )}

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

    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 25,
    height: 25,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  commentContent: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  imageCarousel: {
    marginTop: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  commentImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    resizeMode: "cover",
  },
  deleteImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: "#888",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  userBack: {
    backgroundColor: '#24BCA9',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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

export default CommentItem;
