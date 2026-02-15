import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { CheckCircle2, Home, ShoppingBag, MapPin, Receipt } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const OrderConfirmationScreen = ({ route, navigation }) => {
    const { order } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.successContainer}>
                    <CheckCircle2 size={80} color={COLORS.success} />
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>Your delicious food is being prepared.</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Order Details</Text>
                    <View style={styles.row}>
                        <Receipt size={18} color={COLORS.textLight} />
                        <Text style={styles.rowText}>Order ID: #{order._id.slice(-8).toUpperCase()}</Text>
                    </View>
                    <View style={styles.row}>
                        <MapPin size={18} color={COLORS.textLight} />
                        <Text style={styles.rowText} numberOfLines={2}>
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.quantity} x {item.name}</Text>
                            <Text style={styles.itemPrice}>₹{item.subtotal}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Home size={20} color="#000" />
                        <Text style={styles.primaryBtnText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => navigation.navigate('OrderTracking', { orderId: order._id })}
                    >
                        <ShoppingBag size={20} color={COLORS.primary} />
                        <Text style={styles.secondaryBtnText}>Track Order</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    successContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    successTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    successSubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    rowText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    itemPrice: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    totalValue: {
        ...TYPOGRAPHY.h1,
        color: COLORS.primary,
        fontSize: 24,
    },
    footer: {
        gap: SPACING.md,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    primaryBtnText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: '#000',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 8,
    },
    secondaryBtnText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export default OrderConfirmationScreen;
