import React from "react";
import { Modal, View, Image, StyleSheet } from "react-native";

export default function SeeImage({ imagen, modalVisible, setModalVisible }) {
  const handleCancel = async () => {
    setModalVisible(!modalVisible);
  };

  return (
    <Modal visible={modalVisible} transparent={true} animationType={"none"}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.overlay}></View>
        </TouchableWithoutFeedback>
        <View style={styles.modalStyle}>
          <Image style={styles.image} source={{ uri: imagen.image }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalStyle: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  image: {
    width: '90%',
    height: '50%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
});
