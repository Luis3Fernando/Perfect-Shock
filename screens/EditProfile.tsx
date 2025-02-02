import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ImageBackground, TextInput, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FontAwesome7 from '@expo/vector-icons/FontAwesome6';
import AntDesign2 from '@expo/vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootState } from '../redux/store';
import { updateUserThunk } from '../redux/features/aditionalSlice'
import * as ImagePicker from 'expo-image-picker';
import { profileUpdate } from '../utils/profile'

const EditProfile = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const { status, error } = useSelector((state: RootState) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(profile?.profile_img ? { uri: `https://bapugoapi.jhedgost.com${profile.profile_img}` } : null);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]); // Actualiza la imagen seleccionada
    }
  };


  const validationSchema = Yup.object().shape({
    username: Yup.string().required('El nombre de usuario es obligatorio'),
    firstName: Yup.string().required('El primer nombre es obligatorio'),
    lastName: Yup.string().required('El apellido es obligatorio'),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('first_name', values.firstName);
    formData.append('last_name', values.lastName);

    if (selectedImage) {
      formData.append('profile_img', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    try {
      const response = await dispatch(updateUserThunk({ userId: profile.id, data: formData })).unwrap();

      // Verificar la respuesta de la API directamente
      if (response.error) {
        throw new Error(response.error);
      }

      Toast.show({
        type: 'success',
        text1: 'Perfil actualizado',
        text2: 'Tu perfil ha sido actualizado con éxito',
      });

      await profileUpdate(dispatch);
      navigation.goBack();
    } catch (error: any) {
      if (error.message === 'El nombre de usuario ya está en uso.') {
        Toast.show({
          type: 'error',
          text1: 'Error al actualizar el perfil',
          text2: 'El nombre de usuario ya está en uso.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error al actualizar el perfil',
          text2: 'Ocurrió un error',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };




  useEffect(() => {
    if (status === 'loading') {
      setIsSubmitting(true);
    } else if (status === 'succeeded') {
      alert('¡Perfil actualizado con éxito!');
      navigation.goBack(); // Regresa a la pantalla anterior
    } else if (status === 'failed') {
      alert(`Hubo un error: ${error}`);
    }
    setIsSubmitting(false);
  }, [status, error]);


  if (!profile) {
    return <ActivityIndicator size="large" color="#61C6B9" />;
  }

  return (
    <View style={styles.content}>
      <ImageBackground
        source={require('../assets/img/ampay.jpg')}
        style={styles.content1}
      >
        <View style={styles.overlay} />
        <Image source={selectedImage ? { uri: selectedImage.uri } : require('../assets/img/default_landscape.jpg')} style={styles.icon} />

        <TouchableOpacity style={styles.addIcon} onPress={pickImage}>
          <AntDesign2 name="pluscircle" size={24} color="#61C6B9" />
        </TouchableOpacity>

        <Text style={styles.title}>{profile?.user ? `${profile.user.first_name}` : 'Nombre del Usuario'}</Text>
      </ImageBackground>

      <Formik
        initialValues={{
          username: profile?.user ? profile.user.username : '',
          firstName: profile?.user ? profile.user.first_name : '',
          lastName: profile?.user ? profile.user.last_name : '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Perfil de Usuario</Text>

            <View style={styles.inputContainer}>
              <FontAwesome7 name="user-circle" size={24} color="#61C6B9" />
              <TextInput
                style={styles.input}
                placeholder="Ingresa el usuario"
                placeholderTextColor="#aaa"
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
              />
            </View>
            {errors.username && touched.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <View style={styles.inputContainer}>
              <FontAwesome7 name="user-circle" size={24} color="#61C6B9" />
              <TextInput
                style={styles.input}
                placeholder="Ingresa el primer nombre"
                placeholderTextColor="#aaa"
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                value={values.firstName}
              />
            </View>
            {errors.firstName && touched.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <View style={styles.inputContainer}>
              <FontAwesome7 name="user-circle" size={24} color="#61C6B9" />
              <TextInput
                style={styles.input}
                placeholder="Ingresa el apellido"
                placeholderTextColor="#aaa"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
              />
            </View>
            {errors.lastName && touched.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Actualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  content1: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
  },
  addIcon: {
    position: 'absolute',
    left: 230,
    top: 75,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    width: '80%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 15,
    position: 'absolute',
    top: 250,
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 20,
    margin: 10,
    color: '#61C6B9',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    width: 300,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#61C6B9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#333',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -5,
    marginBottom: 15
  },
  button: {
    width: 280,
    height: 50,
    backgroundColor: '#61C6B9',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: 25,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    margin: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default EditProfile;
