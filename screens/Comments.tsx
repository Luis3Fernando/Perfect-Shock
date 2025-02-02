import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { createNewComment, addImages } from '../redux/features/commentsSlice';
import Toast from 'react-native-toast-message';


export default function CommentScreen({ route, navigation }: { route: any; navigation: any }) {
    const [loading, setLoading] = useState(false);
    const { place, user } = route.params;
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const dispatch = useDispatch<AppDispatch>();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            const selectedImages = result.assets.map((asset: any) => asset.uri);
            if (images.length + selectedImages.length <= 10) {
                setImages([...images, ...selectedImages]);
            } else {
                alert('Máximo 10 imágenes permitidas');
            }
        }
    };

    const removeImage = (uri: string) => {
        setImages(images.filter((image) => image !== uri));
    };

    const handleComment = async () => {
        if (comment.trim() === '') { Toast.show({ type: 'error', text1: 'Error', text2: 'El comentario no puede estar vacío', }); return;}
        setLoading(true);
        try {
            const newComment = await dispatch(createNewComment({ placeId: place.id, content: comment })).unwrap();

            if (images.length > 0) {
                const imageFiles = images.map(uri => ({
                    uri,
                    name: `image-${Date.now()}.jpg`,
                    type: 'image/jpeg',
                }));
                await dispatch(addImages({ commentId: newComment.comment, images: imageFiles })).unwrap();
            }

            Toast.show({
                type: 'success',
                text1: 'Comentario agregado',
                text2: 'Tu comentario ha sido publicado exitosamente',
            });

            setLoading(false);
            navigation.navigate('Place', { id: place.id });
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Hubo un problema al agregar tu comentario',
            });
            setLoading(false); // Detiene el indicador de carga en caso de error
        }
    };


    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator style={{ position: 'absolute', top: 30, alignSelf: 'center' }} size="large" color="#24BCA9" />}
            {/* Botón de regresar */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* Título para el lugar */}
            <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color="#C0C0C0" />
                <Text style={styles.sectionTitle}>Lugar a comentar</Text>
            </View>

            {/* Tarjeta de información del lugar */}
            <View style={styles.placeCard}>
                {place.photos.length > 0 ? (
                    <Image style={styles.placeImage} source={{ uri: place.photos[0].image }} />
                ) : (
                    <Image style={styles.placeImage} source={require('../assets/img/default_landscape.jpg')} />
                )}
                <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCategory}>{place.category.name} · {place.type.name}</Text>
                    <Text style={styles.placeAddress}>{place.address}</Text>
                </View>
            </View>

            {/* Título para el usuario */}
            <View style={styles.sectionHeader}>
                <Ionicons name="person-circle-outline" size={18} color="#C0C0C0" />
                <Text style={styles.sectionTitle}>Usuario</Text>
            </View>

            {/* Usuario */}
            <View style={styles.userInfo}>
                {user.profile_img ? (
                    <Image source={{ uri: `https://bapugoapi.jhedgost.com${user.profile_img}` }} style={styles.avatar} />
                ) : (
                    <Image style={styles.avatar} source={require('../assets/img/default_user.jpg')} />
                )}
                <Text style={styles.userName}>{user.user.username}</Text>
            </View>

            {/* Título para el comentario */}
            <View style={styles.sectionHeader}>
                <Feather name="message-square" size={18} color="#C0C0C0" />
                <Text style={styles.sectionTitle}>Comentario</Text>
            </View>

            {/* Input de comentario */}
            <TextInput
                style={styles.input}
                placeholder="Escribe tu comentario..."
                value={comment}
                onChangeText={setComment}
                multiline
            />

            {/* Botón para seleccionar imágenes */}
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <MaterialIcons name="photo-library" size={18} color="#fff" style={styles.imageIcon} />
                <Text style={styles.imagePickerText}>Seleccionar imágenes</Text>
            </TouchableOpacity>

            {/* Vista previa de imágenes */}
            <FlatList
                data={images}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item }} style={styles.selectedImage} />
                        <TouchableOpacity
                            style={styles.deleteImageButton}
                            onPress={() => removeImage(item)}
                        >
                            <Ionicons name="close-circle" size={24} color="#666666" />
                        </TouchableOpacity>
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Botón de comentar */}
            <TouchableOpacity style={styles.commentButton} onPress={handleComment}>
                <Feather name="send" size={18} color="#fff" style={styles.commentIcon} />
                <Text style={styles.commentButtonText}>Comentar</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    backButton: { marginBottom: 20 },

    // Sección de título
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#C0C0C0', marginLeft: 8 },

    // Tarjeta de lugar
    placeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        marginRight: 10,
        marginTop: 10,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    deleteImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
    },

    placeImage: { width: 100, height: 120, borderRadius: 10 },
    placeInfo: { flex: 1, padding: 10, justifyContent: 'center' },
    placeName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    placeCategory: { fontSize: 14, color: '#777', marginVertical: 4 },
    placeAddress: { fontSize: 12, color: '#aaa' },

    // Usuario
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    userName: { fontSize: 16, fontWeight: 'bold' },

    // Input de comentario
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        height: 100,
        marginBottom: 20,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
    },

    // Botón para seleccionar imágenes
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#61C6B9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    imagePickerText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    imageIcon: { marginRight: 8 },

    // Vista previa de imágenes
    imagePreview: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },

    // Botón de comentar
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#61C6B9',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
    },
    commentButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    commentIcon: { marginRight: 8 },
});
