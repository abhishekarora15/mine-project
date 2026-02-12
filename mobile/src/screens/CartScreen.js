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
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: '#FFF',
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
    },
    headerSubtitle: {
        ...TYPOGRAPHY.label,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
        borderColor: '#CCC',
        padding: 1.5,
    },
    vegCircle: {
        flex: 1,
        borderRadius: 1,
    },
    itemName: {
        ...TYPOGRAPHY.body,
        fontWeight: '500',
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
        fontWeight: '600',
        width: 60,
        textAlign: 'right',
    },
    footer: {
        padding: SPACING.md,
    },
    billDetails: {
        backgroundColor: '#FFF',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.md,
    },
    billTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
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
    },
    totalRow: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalLabel: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    totalValue: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    bottomBar: {
        padding: SPACING.md,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    checkoutBtn: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
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
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default CartScreen;
