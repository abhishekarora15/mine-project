import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { ChevronLeft, Trash2, Plus, Minus } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useCartStore from '../store/cartStore';

const CartScreen = ({ navigation }) => {
    const { items, restaurant, addItem, removeItem, clearCart, getTotal } = useCartStore();

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }}
                    style={styles.emptyImage}
                />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.browseBtnText}>Browse Restaurants</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{restaurant?.name}</Text>
                        <Text style={styles.headerSubtitle}>View Cart</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={clearCart}>
                    <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <FlatList
                style={{ flex: 1 }}
                data={items}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <View style={styles.cartItemLeft}>
                            <View style={styles.vegBadge}>
                                <View style={[styles.vegCircle, { backgroundColor: item.isVeg ? '#008000' : '#8B0000' }]} />
                            </View>
                            <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                        <View style={styles.stepper}>
                            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.stepperBtn}>
                                <Minus size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.stepperText}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => addItem(item, restaurant)} style={styles.stepperBtn}>
                                <Plus size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <View style={styles.billDetails}>
                            <Text style={styles.billTitle}>Bill Details</Text>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Item Total</Text>
                                <Text style={styles.billValue}>₹{getTotal()}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Delivery Fee</Text>
                                <Text style={styles.billValue}>₹30</Text>
                            </View>
                            <View style={[styles.billRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>To Pay</Text>
                                <Text style={styles.totalValue}>₹{getTotal() + 30}</Text>
                            </View>
                        </View>
                    </View>
                }
            />

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => {
                        Alert.alert(
                            "Confirm Order",
                            "Would you like to proceed with the payment?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Pay Now", onPress: () => navigation.navigate('OrderTracking') }
                            ]
                        );
                    }}
                >
                    <Text style={styles.checkoutBtnText}>Proceed to Pay</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerInfo: {
        marginLeft: SPACING.sm,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
    },
    headerSubtitle: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    cartItemLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    vegBadge: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderColor: COLORS.textLight,
        padding: 1.5,
    },
    vegCircle: {
        flex: 1,
        borderRadius: 1,
    },
    itemName: {
        ...TYPOGRAPHY.body,
        fontWeight: '500',
        color: COLORS.text,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: 4,
        marginHorizontal: SPACING.md,
    },
    stepperBtn: {
        padding: 6,
    },
    stepperText: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginHorizontal: 8,
    },
    itemPrice: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: COLORS.text,
        width: 60,
        textAlign: 'right',
    },
    footer: {
        padding: SPACING.md,
    },
    billDetails: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    billTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    billLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
    },
    billValue: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    totalRow: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    totalValue: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.primary,
    },
    bottomBar: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    checkoutBtn: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    emptyImage: {
        width: 200,
        height: 200,
        marginBottom: SPACING.xl,
        opacity: 0.5,
    },
    emptyText: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textLight,
        marginBottom: SPACING.lg,
    },
    browseBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseBtnText: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default CartScreen;
