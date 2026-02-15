import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { ChevronLeft, ShoppingBag, ChevronRight, Clock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import axios from 'axios';
import { API_URL } from '../constants/config';
import useAuthStore from '../store/authStore';

const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'pending': return COLORS.warning;
            case 'confirmed': return COLORS.success;
            case 'preparing': return '#2196F3';
            case 'out_for_delivery': return '#9C27B0';
            case 'delivered': return COLORS.success;
            case 'cancelled': return COLORS.error;
            default: return COLORS.textLight;
        }
    };

    return (
        <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor() }]}>
                {status.toUpperCase().replace('_', ' ')}
            </Text>
        </View>
    );
};

const OrderItem = ({ order, onPress }) => (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
        <View style={styles.orderHeader}>
            <View>
                <Text style={styles.restaurantName}>{order.restaurantId?.name || 'Restaurant'}</Text>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <StatusBadge status={order.orderStatus} />
        </View>

        <View style={styles.orderBody}>
            <Text style={styles.orderItems} numberOfLines={1}>
                {order.items.map(i => `${i.quantity} x ${i.name}`).join(', ')}
            </Text>
            <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
                <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <ChevronRight size={16} color={COLORS.primary} />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const OrdersHistoryScreen = ({ navigation }) => {
    const { token } = useAuthStore();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.data.orders);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={orders}
                renderItem={({ item }) => (
                    <OrderItem
                        order={item}
                        onPress={() => navigation.navigate('OrderConfirmation', { order: item })}
                    />
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ShoppingBag size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.exploreBtnText}>Explore Restaurants</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.md,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
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
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    restaurantName: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
    },
    orderDate: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    orderBody: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
    },
    orderItems: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTotal: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
    },
    viewDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        ...TYPOGRAPHY.label,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    exploreBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreBtnText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default OrdersHistoryScreen;
