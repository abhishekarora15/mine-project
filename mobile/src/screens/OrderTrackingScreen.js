import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChevronLeft, Phone, MessageSquare, MapPin, Truck } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { initiateSocketConnection, disconnectSocket, joinOrderRoom, leaveOrderRoom, subscribeToStatusUpdates, subscribeToLocationUpdates } from '../utils/socket';

const OrderTrackingScreen = ({ navigation, route }) => {
    const { order: initialOrder } = route.params || {};
    const [order, setOrder] = useState(initialOrder);
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!order?._id) return;

        initiateSocketConnection();
        joinOrderRoom(order._id);

        subscribeToStatusUpdates((data) => {
            if (data.order) {
                setOrder(data.order);
            }
        });

        subscribeToLocationUpdates((data) => {
            setDeliveryLocation({
                latitude: data.latitude,
                longitude: data.longitude
            });
        });

        return () => {
            leaveOrderRoom(order._id);
            disconnectSocket();
        };
    }, [order?._id]);

    const getSteps = () => [
        { title: 'Order Placed', completed: true },
        { title: 'Confirmed', completed: ['confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.orderStatus) },
        { title: 'Preparing Food', completed: ['preparing', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.orderStatus) },
        { title: 'Out for Delivery', completed: ['picked_up', 'out_for_delivery', 'delivered'].includes(order.orderStatus) },
        { title: 'Delivered', completed: order.orderStatus === 'delivered' },
    ];

    const restaurantCoords = order.restaurantId?.location?.coordinates ? {
        latitude: order.restaurantId.location.coordinates[1],
        longitude: order.restaurantId.location.coordinates[0]
    } : null;

    const customerCoords = order.deliveryAddress?.coordinates ? {
        latitude: order.deliveryAddress.coordinates.lat,
        longitude: order.deliveryAddress.coordinates.lng
    } : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order #{order?._id?.slice(-6)}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: customerCoords?.latitude || 28.6139,
                        longitude: customerCoords?.longitude || 77.2090,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    {restaurantCoords && (
                        <Marker coordinate={restaurantCoords} title="Restaurant">
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerIcon, { backgroundColor: COLORS.success }]}>
                                    <MapPin size={16} color="#FFF" />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {customerCoords && (
                        <Marker coordinate={customerCoords} title="Your Location">
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerIcon, { backgroundColor: COLORS.primary }]}>
                                    <MapPin size={16} color="#000" />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {deliveryLocation && (
                        <Marker coordinate={deliveryLocation} title="Delivery Partner">
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerIcon, { backgroundColor: COLORS.warning || '#f39c12' }]}>
                                    <Truck size={16} color="#FFF" />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {restaurantCoords && customerCoords && (
                        <Polyline
                            coordinates={[restaurantCoords, customerCoords]}
                            strokeWidth={3}
                            strokeColor={COLORS.primary}
                        />
                    )}
                </MapView>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.deliveryInfo}>
                    <View>
                        <Text style={styles.arrivalTitle}>
                            {order.orderStatus === 'delivered' ? 'Order Delivered!' : 'Tracking Live Status'}
                        </Text>
                        <Text style={styles.deliveryStatus}>
                            Current status: {order.orderStatus.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.trackingSteps}>
                    {getSteps().map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepIndicator}>
                                <View style={[styles.stepCircle, { backgroundColor: step.completed ? COLORS.success : '#CBD5E1' }]} />
                                {index !== getSteps().length - 1 && <View style={[styles.stepLine, { backgroundColor: step.completed ? COLORS.success : '#CBD5E1' }]} />}
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: step.completed ? COLORS.text : COLORS.textLight }]}>{step.title}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Phone size={20} color={COLORS.primary} />
                        <Text style={styles.actionBtnText}>Call Partner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageSquare size={20} color={COLORS.primary} />
                        <Text style={styles.actionBtnText}>Help</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.md,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        zIndex: 10,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    mapWrapper: {
        height: '45%',
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerContainer: {
        padding: 5,
    },
    markerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    statusCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    deliveryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    arrivalTitle: {
        ...TYPOGRAPHY.h1,
        fontSize: 20,
        color: COLORS.primary,
    },
    deliveryStatus: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        fontSize: 14,
        marginTop: 4,
    },
    trackingSteps: {
        flex: 1,
    },
    stepRow: {
        flexDirection: 'row',
        height: 50,
    },
    stepIndicator: {
        alignItems: 'center',
        width: 30,
        marginRight: 15,
    },
    stepCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginTop: -2,
        marginBottom: -2,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingTop: SPACING.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
    },
    actionBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default OrderTrackingScreen;
