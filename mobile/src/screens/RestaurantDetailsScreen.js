import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Share2, Info, Star, Plus, Minus } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useCartStore from '../store/cartStore';
import useRestaurantStore from '../store/restaurantStore';

const MenuItem = ({ item, restaurant }) => {
    const { addItem, updateQuantity, items } = useCartStore();
    const cartItem = items.find(i => i.menuItemId === item._id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        addItem(item, restaurant);
    };

    const handleUpdateQuantity = (delta) => {
        updateQuantity(item._id, delta);
    };

    return (
        <View style={styles.menuItem}>
            <View style={styles.menuItemInfo}>
                <View style={styles.vegBadge}>
                    <View style={[styles.vegCircle, { backgroundColor: item.isVeg ? COLORS.success : COLORS.error }]} />
                </View>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={styles.menuItemImageContainer}>
                <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349' }} style={styles.menuItemImage} />
                <View style={styles.addButtonContainer}>
                    {quantity > 0 ? (
                        <View style={styles.stepper}>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(-1)} style={styles.stepperBtn}>
                                <Minus size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.stepperText}>{quantity}</Text>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(1)} style={styles.stepperBtn}>
                                <Plus size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>ADD</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const RestaurantDetailsScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const { items, getBillDetails, fetchCart } = useCartStore();
    const { currentMenu, loading, fetchRestaurantMenu } = useRestaurantStore();

    const { total } = getBillDetails();

    React.useEffect(() => {
        fetchCart();
        fetchRestaurantMenu(restaurant._id);
    }, [restaurant._id]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Share2 size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <View>
                            <Image source={{ uri: restaurant.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349' }} style={styles.restaurantBanner} />
                            <View style={styles.restaurantInfo}>
                                <Text style={styles.title}>{restaurant.name}</Text>
                                <Text style={styles.subtitle}>{restaurant.cuisineTypes?.join(' • ') || 'Various'}</Text>
                                <View style={styles.metaInfo}>
                                    <View style={styles.metaItem}>
                                        <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
                                        <Text style={styles.metaText}>{restaurant.rating || '4.0'}</Text>
                                    </View>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.metaText}>30-35 mins</Text>
                                </View>
                                <View style={styles.divider} />
                            </View>
                        </View>
                    }
                    data={Object.entries(
                        currentMenu.reduce((acc, item) => {
                            if (!acc[item.category]) acc[item.category] = [];
                            acc[item.category].push(item);
                            return acc;
                        }, {})
                    ).map(([category, items]) => ({ category, items }))}
                    renderItem={({ item }) => (
                        <View style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{item.category} ({item.items.length})</Text>
                            {item.items.map(menuItem => (
                                <MenuItem key={menuItem._id} item={menuItem} restaurant={restaurant} />
                            ))}
                        </View>
                    )}
                    keyExtractor={(item) => item.category}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: items.length > 0 ? 100 : 24 }}
                />
            )}

            {items.length > 0 && (
                <View style={styles.cartFooter}>
                    <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
                        <View>
                            <Text style={styles.cartCount}>{items.length} ITEM{items.length > 1 ? 'S' : ''}</Text>
                            <Text style={styles.cartTotal}>₹{Math.round(total)} plus taxes</Text>
                        </View>
                        <View style={styles.viewCartAction}>
                            <Text style={styles.viewCartText}>View Cart</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.md,
        alignItems: 'center',
    },
    backBtn: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    headerIcon: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restaurantBanner: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    restaurantInfo: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 22,
        color: COLORS.text,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: 4,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...TYPOGRAPHY.label,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    metaDot: {
        color: COLORS.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.lg,
    },
    categorySection: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    categoryTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuItemInfo: {
        flex: 1,
        paddingRight: SPACING.md,
    },
    vegBadge: {
        width: 14,
        height: 14,
        borderWidth: 1,
        borderColor: COLORS.textLight,
        padding: 2,
        marginBottom: 4,
    },
    vegCircle: {
        flex: 1,
        borderRadius: 2,
    },
    menuItemName: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
    },
    menuItemPrice: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginVertical: 4,
    },
    menuItemDesc: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
        lineHeight: 18,
    },
    menuItemImageContainer: {
        width: 120,
        height: 120,
        position: 'relative',
    },
    menuItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: -15,
        alignSelf: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: 90,
        height: 36,
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addBtn: {
        alignItems: 'center',
    },
    addBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    stepper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    stepperBtn: {
        padding: 4,
    },
    stepperText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cartFooter: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    cartBar: {
        backgroundColor: COLORS.success,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cartCount: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cartTotal: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    viewCartAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewCartText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default RestaurantDetailsScreen;
