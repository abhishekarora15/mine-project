import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { DollarSign, Clock, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useDeliveryStore from '../store/deliveryStore';

const EarningItem = ({ item }) => (
    <View style={styles.earningCard}>
        <View style={styles.earningInfo}>
            <View style={styles.iconCircle}>
                <CheckCircle size={16} color={COLORS.success} />
            </View>
            <View>
                <Text style={styles.earningTitle}>Delivery Commission</Text>
                <Text style={styles.earningDate}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
        <Text style={styles.earningAmount}>+₹{item.totalEarnings || 40}</Text>
    </View>
);

const EarningsScreen = () => {
    const { stats, assignedOrders, loading, fetchDashboard, fetchAssignedOrders } = useDeliveryStore();

    React.useEffect(() => {
        fetchDashboard();
        fetchAssignedOrders();
    }, []);

    // Simulating earning history from delivered orders
    const history = assignedOrders.filter(o => o.orderStatus === 'delivered');

    if (loading && stats.earningsTotal === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Earnings</Text>
                <Text style={styles.summaryValue}>₹{stats.earningsTotal}</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryStat}>
                        <Text style={styles.statLabel}>Deliveries</Text>
                        <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryStat}>
                        <Text style={styles.statLabel}>Avg Rating</Text>
                        <Text style={styles.statValue}>★ {stats.rating}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Earnings</Text>
            <FlatList
                data={history}
                renderItem={({ item }) => <EarningItem item={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <DollarSign size={48} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No earnings history yet.</Text>
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
    summaryCard: {
        backgroundColor: COLORS.primary,
        margin: SPACING.md,
        borderRadius: 24,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#000',
        fontSize: 16,
        opacity: 0.7,
    },
    summaryValue: {
        color: '#000',
        fontSize: 48,
        fontWeight: 'bold',
        marginVertical: SPACING.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        width: '100%',
        justifyContent: 'space-around',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    summaryStat: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#000',
        fontSize: 12,
        opacity: 0.7,
    },
    statValue: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    listContent: {
        paddingHorizontal: SPACING.md,
    },
    earningCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 16,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    earningInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    earningTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    earningDate: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
        fontSize: 12,
    },
    earningAmount: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
        color: COLORS.success,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: SPACING.md,
    },
});

export default EarningsScreen;
