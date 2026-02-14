import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, MapPin, Star, Clock, User } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useAuthStore from '../store/authStore';
import useRestaurantStore from '../store/restaurantStore';
import useLocationStore from '../store/locationStore';
import LocationPickerModal from '../components/LocationPickerModal';

const CATEGORIES = [
    { id: '1', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
    { id: '2', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
    { id: '3', name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
    { id: '4', name: 'Biryani', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
];

const RestaurantCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1550547660-d9450f859349' }} style={styles.cardImage} />
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.ratingBadge}>
                    <Star size={12} color="#FFF" fill="#FFF" />
                    <Text style={styles.ratingText}>{item.rating || '4.0'}</Text>
                </View>
            </View>
            <Text style={styles.cardSubtitle}>{item.cuisineTypes?.join(', ') || 'Various'}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.infoItem}>
                    <Clock size={14} color={COLORS.textLight} />
                    <Text style={styles.infoText}>25-30 mins</Text>
                </View>
                <Text style={styles.infoText}>• 2.5 km</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const [isLocationModalVisible, setIsLocationModalVisible] = React.useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const { restaurants, loading, fetchRestaurants } = useRestaurantStore();
    const { address, fetchLocation } = useLocationStore();

    React.useEffect(() => {
        const loadInitialData = async () => {
            await fetchLocation();
            // Restaurants will be fetched by the second useEffect when location updates
        };
        loadInitialData();
    }, []);

    React.useEffect(() => {
        if (location?.coords) {
            fetchRestaurants(location.coords.latitude, location.coords.longitude);
        }
    }, [location]);

    const handleRefresh = () => {
        if (location?.coords) {
            fetchRestaurants(location.coords.latitude, location.coords.longitude);
        } else {
            fetchRestaurants();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.locationContainer}
                    onPress={() => setIsLocationModalVisible(true)}
                >
                    <MapPin size={20} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.locationTitle}>Delivery to</Text>
                        <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Login')}
                >
                    <View style={styles.profileCircle}>
                        {isAuthenticated && user?.name ? (
                            <Text style={styles.profileInitial}>{user.name[0]}</Text>
                        ) : (
                            <User size={20} color={COLORS.textLight} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.textLight} />
                    <TextInput
                        placeholder="Search for restaurants and food"
                        style={styles.searchInput}
                    />
                </View>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>What's on your mind?</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.categoryItem}
                            onPress={() => console.log(`Searching for ${item.name}...`)}
                        >
                            <Image source={{ uri: item.image }} style={styles.categoryImage} />
                            <Text style={styles.categoryText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.categoryList}
                />

                {/* Top Restaurants */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Restaurants Near You</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                        <Text style={styles.loadingText}>Fetching delicious food...</Text>
                    </View>
                ) : restaurants.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No restaurants found nearby.</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={fetchRestaurants}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    restaurants.map(item => (
                        <RestaurantCard
                            key={item._id}
                            item={item}
                            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
                        />
                    ))
                )}
            </ScrollView>

            <LocationPickerModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
        marginRight: SPACING.md,
    },
    locationTitle: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    locationText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    profileBtn: {
        padding: 2,
    },
    profileCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    profileInitial: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: 16,
        height: 54,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    categoryList: {
        paddingLeft: SPACING.md,
        marginBottom: SPACING.lg,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: SPACING.lg,
    },
    categoryImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: SPACING.xs,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    categoryText: {
        ...TYPOGRAPHY.label,
        fontWeight: '600',
        color: COLORS.text,
    },
    card: {
        marginHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        gap: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    loadingContainer: {
        padding: 50,
        alignItems: 'center',
    },
    loadingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: SPACING.md,
    },
    emptyContainer: {
        padding: 50,
        alignItems: 'center',
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginBottom: SPACING.lg,
    },
    retryBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 12,
    },
    retryText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default HomeScreen;
