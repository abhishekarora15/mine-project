import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { ChevronLeft, Trash2, Plus, Minus } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useCartStore from '../store/cartStore';

import { API_URL } from '../constants/config';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';

const CartScreen = ({ navigation }) => {
    const { items, restaurant, updateQuantity, clearCart, getBillDetails, fetchCart } = useCartStore();
    const { token } = useAuthStore();
    const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

    const { subtotal, tax, deliveryFee, total } = getBillDetails();

    React.useEffect(() => {
        fetchCart();
    }, []);

    const handlePlaceOrder = async () => {
        if (!token) {
            Alert.alert('Login Required', 'Please login to place an order', [
                { text: 'Login', onPress: () => navigation.navigate('Login') },
                { text: 'Cancel', style: 'cancel' }
            ]);
            return;
        }

        setIsPlacingOrder(true);
        try {
            // STEP 1: Create Order on Backend (Returns Razorpay Order ID)
            const orderData = {
                deliveryAddress: {
                    street: 'Home - Dwarka Sector 12',
                    city: 'New Delhi',
                    coordinates: { lat: 28.5921, lng: 77.0460 }
                },
                paymentMethod: 'RAZORPAY'
            };

            const response = await axios.post(`${API_URL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                const { order, paymentUrl } = response.data.data;

                // STEP 2: Redirect to PhonePe Pay Page
                if (paymentUrl) {
                    // We use Linking to open the PhonePe payment page in the browser/app
                    // Ideally, you would use a WebView here for better UX
                    Linking.openURL(paymentUrl);

                    // After redirection, the user will come back to the app via a deep link
                    // or we can show a "Check Status" button or poll
                    Alert.alert(
                        'Payment Initiated',
                        'Please complete the payment in the browser. Would you like to check the status?',
                        [
                            {
                                text: 'Check Status',
                                onPress: () => verifyPhonePePayment(order.paymentId)
                            },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                }
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to initiate order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const verifyPhonePePayment = async (merchantTransactionId) => {
        try {
            const response = await axios.post(`${API_URL}/orders/verify-payment`, {
                merchantTransactionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                useCartStore.setState({ items: [], restaurant: null });
                navigation.navigate('OrderConfirmation', { order: response.data.data.order });
            }
        } catch (err) {
            Alert.alert('Payment Not Found', 'We could not verify your payment yet. If you have paid, it will reflect in your orders history soon.');
        }
    };

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
                            <TouchableOpacity onPress={() => updateQuantity(item.menuItemId, -1)} style={styles.stepperBtn}>
                                <Minus size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.stepperText}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => updateQuantity(item.menuItemId, 1)} style={styles.stepperBtn}>
                                <Plus size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.menuItemId}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <View style={styles.billDetails}>
                            <Text style={styles.billTitle}>Bill Details</Text>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Item Total</Text>
                                <Text style={styles.billValue}>₹{subtotal}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Delivery Fee</Text>
                                <Text style={styles.billValue}>₹{deliveryFee}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Taxes & Charges</Text>
                                <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.billRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>To Pay</Text>
                                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                }
            />

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, isPlacingOrder && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={isPlacingOrder}
                >
                    {isPlacingOrder ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.checkoutBtnText}>Proceed to Pay ₹{total.toFixed(2)}</Text>
                    )}
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
