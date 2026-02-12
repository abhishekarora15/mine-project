import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Search, MapPin, Star, Clock, User } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useAuthStore from '../store/authStore';

const CATEGORIES = [
    { id: '1', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
    { id: '2', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
    { id: '3', name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
    { id: '4', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8' },
];

const RESTAURANTS = [
    {
        id: '1',
        name: 'The Burger Club',
        cuisine: 'American • Burgers',
        rating: 4.5,
        time: '25-30 mins',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        distance: '2.5 km',
    },
    {
        id: '2',
        name: 'Pizza Hut',
        cuisine: 'Italian • Pizza',
        rating: 4.2,
        time: '30-40 mins',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        distance: '3.1 km',
    },
];

const RestaurantCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.ratingBadge}>
                    <Star size={12} color="#FFF" fill="#FFF" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            </View>
            <Text style={styles.cardSubtitle}>{item.cuisine}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.infoItem}>
                    <Clock size={14} color={COLORS.textLight} />
                    <Text style={styles.infoText}>{item.time}</Text>
                </View>
                <Text style={styles.infoText}>• {item.distance}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.locationContainer}>
                    <MapPin size={20} color={COLORS.primary} />
                    <View>
                        <Text style={styles.locationTitle}>Delivery to</Text>
                        <Text style={styles.locationText}>Home - Dwarka Sector 12</Text>
                    </View>
                </View>
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

            <ScrollView showsVerticalScrollIndicator={false}>
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
                {RESTAURANTS.map(item => (
                    <RestaurantCard
                        key={item.id}
                        item={item}
                        onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
                    />
                ))}
            </ScrollView>
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
    },
    locationTitle: {
        ...TYPOGRAPHY.label,
    },
    locationText: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
    },
    profileBtn: {
        padding: 2,
    },
    profileCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        ...TYPOGRAPHY.body,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: SPACING.xs,
    },
    categoryText: {
        ...TYPOGRAPHY.label,
        fontWeight: '600',
        color: COLORS.text,
    },
    card: {
        marginHorizontal: SPACING.md,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardImage: {
        width: '100%',
        height: 180,
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
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
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
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        ...TYPOGRAPHY.label,
    },
});

export default HomeScreen;
