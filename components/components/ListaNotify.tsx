import React from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';



const formatDate = (dateString: string) => {
  const date = moment(dateString);
  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');

  if (date.isSame(today, 'day')) {
    return 'Hoy';
  } else if (date.isSame(yesterday, 'day')) {
    return 'Ayer';
  } else {
    return date.format('DD MMMM YYYY');
  }
};


export default function ListaNotify({ item }: { item: any }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} style={styles.containerNotification}>
        <Image style={styles.imageNotification} source={require("../assets/icon/ApuGo.png")} />
        <View style={{ width: '100%', marginLeft: 15 }}>
          <Text style={{ fontWeight: '300', fontSize: 15, flexWrap: 'wrap', width: '100%', color: 'black' }}>{item.type}</Text>
          <Text style={{ color: '#61C6B9', flexWrap: 'wrap', width: '70%', marginVertical: 10 }}>{item.message}</Text>
          <Text style={{ fontWeight: '100', fontSize: 12 }}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.linea} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerNotification: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    marginTop: 10,
    alignItems: 'center',
    marginLeft: 20,
  },
  imageNotification: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 0,
  },
  linea: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    width: '100%',
    marginTop: 10,
    alignSelf: 'center'
  },
});