import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { DollarSign, ShoppingBag, Star, Activity, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useDeliveryStore from '../store/deliveryStore';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
        </View>
        <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    </View>
);

const DeliveryDashboard = ({ navigation }) => {
    const { stats, loading, fetchDashboard, toggleAvailability } = useDeliveryStore();

    React.useEffect(() => {
        fetchDashboard();
    }, []);

    const onRefresh = () => {
        fetchDashboard();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Delivery Dashboard</Text>
                <View style={styles.availabilityContainer}>
                    <Text style={[styles.availabilityText, { color: stats.isAvailable ? COLORS.success : COLORS.textLight }]}>
                        {stats.isAvailable ? 'Online' : 'Offline'}
                    </Text>
                    <Switch
                        value={stats.isAvailable}
                        onValueChange={toggleAvailability}
                        trackColor={{ false: COLORS.border, true: COLORS.success + '80' }}
                        thumbColor={stats.isAvailable ? COLORS.success : '#f4f3f4'}
                    />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.statsGrid}>
                    <StatCard title="Total Earnings" value={`₹${stats.earningsTotal}`} icon={DollarSign} color={COLORS.success} />
                    <StatCard title="Total Deliveries" value={stats.totalDeliveries} icon={ShoppingBag} color={COLORS.primary} />
                    <StatCard title="Active Orders" value={stats.activeOrders} icon={Activity} color={COLORS.warning || '#f39c12'} />
                    <StatCard title="Rating" value={stats.rating} icon={Star} color={COLORS.secondary || '#9b59b6'} />
                </View>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('AssignedOrders')}
                >
                    <View style={styles.actionInfo}>
                        <ShoppingBag size={24} color={COLORS.primary} />
                        <View>
                            <Text style={styles.actionTitle}>Assigned Orders</Text>
                            <Text style={styles.actionSubtitle}>{stats.activeOrders} ongoing deliveries</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Earnings')}
                >
                    <View style={styles.actionInfo}>
                        <DollarSign size={24} color={COLORS.success} />
                        <View>
                            <Text style={styles.actionTitle}>Detailed Earnings</Text>
                            <Text style={styles.actionSubtitle}>View your daily/weekly breakdown</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                </TouchableOpacity>
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
        marginBottom: SPACING.lg,
    },
    headerTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.text,
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    availabilityText: {
        ...TYPOGRAPHY.label,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: '47%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
        fontSize: 18,
    },
    statTitle: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    actionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    actionTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.text,
    },
    actionSubtitle: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.textLight,
    },
});

export default DeliveryDashboard;
