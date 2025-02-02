import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { refreshTokens, fetchUserProfile } from '../redux/features/authSlice';
import { setProfile } from '../redux/features/profileSlice';

import Login from '../screens/Login';
import Presentation from '../screens/Presentation';
import Home from '../screens/Home';
import Map from '../screens/Map';
import Profile from '../screens/ProfileFirst';
import Search from '../screens/Search';
import Brujula from '../screens/Brujula';
import Comments from '../screens/Comments';
import SingUp from '../screens/SingUp';
import SingIn from '../screens/SingIn';
import Notifications from '../screens/Notifications';
import PlaceDetail from '../screens/Place';
import Events from '../screens/Events';
import PhotoSpot from '../screens/PhotoSpot';
import Settings from '../screens/Settings';
import EmailConfirmation from '../screens/EmailConfirmation';
import ValidationPassword from '../screens/ValidationPassword';
import EditProfile from '../screens/EditProfile';
import Somos from '../screens/Somos';
import Socies from '../screens/Socies';
import UpdatePassword from '../screens/UpdatePassword';
import Emergency from '../screens/Emergency';

import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeScreenStack() {
    return (
        <Stack.Navigator initialRouteName='Main' screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Main"
                component={Home} />
            <Stack.Screen
                name="Comments"
                component={Comments} />
        </Stack.Navigator>
    )
}

function HomeScreen() {
    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                tabBarLabel: () => null,
                tabBarActiveTintColor: '#24bca9',
                headerShown: false,
                tabBarStyle: { height: 60, backgroundColor: '#ffffff' }
            }}

        >
            <Tab.Screen
                name="Home"
                component={HomeScreenStack}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View>
                            <View style={[styles.tabIcon, { backgroundColor: focused ? '#24bca9' : 'transparent' }]}>
                            </View>
                            <View style={styles.tabIconIcon}>
                                <Foundation name="home" color={color} size={size} />

                            </View>
                        </View>
                    ), headerShown: false,
                }} />
            <Tab.Screen
                name="PhotoSpot"
                component={PhotoSpot}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View>
                            <View style={[styles.tabIcon, { backgroundColor: focused ? '#24bca9' : 'transparent' }]}>
                            </View>
                            <View style={styles.tabIconIcon}>
                                <MaterialCommunityIcons name="camera-iris" color={color} size={size} />
                            </View>
                        </View>
                    ), headerShown: false,
                }} />
            <Tab.Screen
                name="Map"
                component={Map}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View>
                            <View style={[styles.tabIcon, { backgroundColor: focused ? '#24bca9' : 'transparent' }]}>
                            </View>
                            <View style={styles.tabIconIcon}>
                                <Feather name="map" color={color} size={size} />
                            </View>
                        </View>
                    ), headerShown: false,
                }} />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View>
                            <View style={[styles.tabIcon, { backgroundColor: focused ? '#24bca9' : 'transparent' }]}>
                            </View>
                            <View style={styles.tabIconIcon}>
                                <Feather name="user" color={color} size={size} />
                            </View>
                        </View>
                    ), headerShown: false,
                }} />
        </Tab.Navigator>
    );
}

function Navigate() {
    const [screen, setScreen] = useState("Presentation");
    const [isLoading, setIsLoading] = useState(true);
    const dispatch: AppDispatch = useDispatch();

    const isTokenExpired = (token: string): boolean => {
        try {
            const { exp } = JSON.parse(atob(token.split('.')[1]));
            return Date.now() >= exp * 1000;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const checkLaunchAndAuth = async () => {
            try {
                const firstLaunch = await AsyncStorage.getItem('isFirstLaunch');
                const accessToken = await AsyncStorage.getItem('access_token');
                const refreshToken = await AsyncStorage.getItem('refresh_token');

                console.log('firstLaunch', firstLaunch);

                if (firstLaunch === null || firstLaunch === 'true') {
                    await AsyncStorage.setItem('isFirstLaunch', 'false');
                    setScreen("Presentation");
                } else if (accessToken && refreshToken) {
                    if (isTokenExpired(accessToken)) {
                        const refreshResponse = await dispatch(refreshTokens(refreshToken)).unwrap();
                        if (refreshResponse.access) {
                            await AsyncStorage.setItem('access_token', refreshResponse.access);
                            await AsyncStorage.setItem('refresh_token', refreshResponse.refresh);
                        } else {
                            setScreen('LoginScreen');
                            return;
                        }
                    }

                    const accessToken2 = await AsyncStorage.getItem('access_token');

                    const userProfile = await dispatch(fetchUserProfile(accessToken2)).unwrap();
                    console.log('User Profile:', userProfile);

                    dispatch(setProfile({
                        id: userProfile.id,
                        user: {
                            id: userProfile.user.id,
                            username: userProfile.user.username,
                            email: userProfile.user.email,
                            first_name: userProfile.user.first_name,
                            last_name: userProfile.user.last_name,
                            date_joined: userProfile.user.date_joined,
                            last_login: userProfile.user.last_login ? userProfile.user.last_login : null,
                        },
                        profile_img: userProfile.profile_img,
                        is_active: userProfile.is_active,
                        created_at: userProfile.created_at,
                    }));

                    setScreen('HomeScreen');
                }
                else {
                    setScreen("HomeScreen");
                }
            } catch (error) {
                console.error('Error al obtener datos de AsyncStorage', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLaunchAndAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#61C6B9" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, animation: 'none' }}
            initialRouteName={screen}>

            <Stack.Screen name="Presentation" component={Presentation} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SingIn" component={SingIn} />
            <Stack.Screen name="SingUp" component={SingUp} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            
            <Stack.Screen name="Place" component={PlaceDetail} />
            <Stack.Screen name="Comments" component={Comments} />
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="Brujula" component={Brujula} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="EmailConfirmation" component={EmailConfirmation} />
            <Stack.Screen name="Map" component={Map} />
            <Stack.Screen
                name="Settings"
                component={Settings} />
            <Stack.Screen
                name="Somos"
                component={Somos} />
            <Stack.Screen
                name="Socies"
                component={Socies} />
            <Stack.Screen
                name="UpdatePassword"
                component={UpdatePassword} />
            <Stack.Screen
                name="Emergenci"
                component={Emergency} />
            <Stack.Screen
                name="ValidationPassword"
                component={ValidationPassword} />
            <Stack.Screen
                name="EditProfile"
                component={EditProfile} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    tabIcon: {
        width: 50,
        height: 5,
        borderRadius: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
        top: 5,
    },
    tabIconIcon: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        top: 5
    }
});

export default Navigate
