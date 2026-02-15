import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation, Phone, CheckCircle, Package, Truck } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useDeliveryStore from '../store/deliveryStore';

const OrderItem = ({ order, onUpdateStatus }) => {
    const openInMaps = (lat, lng, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <Package size={20} color={COLORS.primary} />;
            case 'picked_up': return <Truck size={20} color={COLORS.warning || '#f39c12'} />;
            case 'out_for_delivery': return <Navigation size={20} color={COLORS.info || '#3498db'} />;
            default: return <CheckCircle size={20} color={COLORS.success} />;
        }
    };

    const getNextStatus = (current) => {
        if (current === 'confirmed') return 'picked_up';
        if (current === 'picked_up') return 'out_for_delivery';
        if (current === 'out_for_delivery') return 'delivered';
        return null;
    };

    const nextStatus = getNextStatus(order.orderStatus);

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.statusBadge}>
                    {getStatusIcon(order.orderStatus)}
                    <Text style={styles.statusText}>{order.orderStatus.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.orderId}>#{order._id.slice(-6)}</Text>
            </View>

            <View style={styles.addressSection}>
                <View style={styles.addressItem}>
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addressLabel}>Pick up from</Text>
                        <Text style={styles.addressText}>{order.restaurantId?.name}</Text>
                        <Text style={styles.addressSubtext}>{order.restaurantId?.location?.address}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openInMaps(order.restaurantId.location.coordinates[1], order.restaurantId.location.coordinates[0], order.restaurantId.name)}
                    >
                        <Navigation size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.line} />

                <View style={styles.addressItem}>
                    <MapPin size={16} color={COLORS.error || '#e74c3c'} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addressLabel}>Deliver to</Text>
                        <Text style={styles.addressText}>{order.deliveryAddress?.street}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openInMaps(order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng, 'Customer Location')}
                    >
                        <Navigation size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {nextStatus && (
                <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: nextStatus === 'delivered' ? COLORS.success : COLORS.primary }]}
                    onPress={() => onUpdateStatus(order._id, nextStatus)}
                >
                    <Text style={styles.statusBtnText}>
                        MARK AS {nextStatus.replace('_', ' ').toUpperCase()}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const AssignedOrders = () => {
    const { assignedOrders, loading, fetchAssignedOrders, updateOrderStatus, updateLocation, startTracking, stopTracking } = useDeliveryStore();

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    // Track location if there's any active order
    useEffect(() => {
        const activeOrder = assignedOrders.find(o => o.orderStatus === 'out_for_delivery');
        let locationWatcher = null;

        const startLocationUpdates = async () => {
            if (activeOrder) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'Location permission is required for real-time tracking.');
                    return;
                }

                startTracking(activeOrder._id);

                locationWatcher = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 10, // Update every 10 meters
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;
                        updateLocation(latitude, longitude, activeOrder._id);
                    }
                );
            }
        };

        startLocationUpdates();

        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
            if (activeOrder) {
                stopTracking(activeOrder._id);
            }
        };
    }, [assignedOrders]);

    const handleUpdateStatus = (id, status) => {
        Alert.alert(
            'Confirm Status Update',
            `Are you sure you want to mark this order as ${status.replace('_', ' ')}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => updateOrderStatus(id, status) }
            ]
        );
    };

    if (loading && assignedOrders.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Deliveries</Text>
            <FlatList
                data={assignedOrders}
                renderItem={({ item }) => (
                    <OrderItem order={item} onUpdateStatus={handleUpdateStatus} />
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No assigned orders at the moment.</Text>
                        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAssignedOrders}>
                            <Text style={styles.refreshText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 50,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.text,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
    },
    listContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        ...TYPOGRAPHY.label,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    orderId: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    addressSection: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    addressLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
        fontSize: 10,
    },
    addressText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addressSubtext: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.textLight,
    },
    line: {
        width: 2,
        height: 20,
        backgroundColor: COLORS.border,
        marginLeft: 4,
        marginVertical: 4,
    },
    statusBtn: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    refreshBtn: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    refreshText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default AssignedOrders;
