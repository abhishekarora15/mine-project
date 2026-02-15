import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { ChevronLeft, LogOut, Package, Settings, CreditCard, ChevronRight, User } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useAuthStore from '../store/authStore';

const ProfileOption = ({ icon: Icon, title, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={styles.optionLeft}>
            <View style={styles.iconBox}>
                <Icon size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.optionTitle}>{title}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textLight} />
    </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout', style: 'destructive', onPress: () => {
                        logout();
                        navigation.replace('Home');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarInitial}>{user?.name ? user.name[0] : 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User Name'}</Text>
                    <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account Settings</Text>
                    <ProfileOption
                        icon={Package}
                        title="My Orders"
                        onPress={() => navigation.navigate('OrdersHistory')}
                    />
                    {user?.role === 'delivery' && (
                        <ProfileOption
                            icon={Package} // Can use better icon if available, but Package is fine
                            title="Delivery Dashboard"
                            onPress={() => navigation.navigate('DeliveryDashboard')}
                        />
                    )}
                    <ProfileOption
                        icon={CreditCard}
                        title="Payment Methods"
                        onPress={() => console.log('Payments')}
                    />
                    <ProfileOption
                        icon={Settings}
                        title="Settings"
                        onPress={() => console.log('Settings')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Support</Text>
                    <ProfileOption
                        icon={User}
                        title="Help Center"
                        onPress={() => console.log('Help')}
                    />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
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
        padding: SPACING.md,
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    profileInfo: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
        marginBottom: SPACING.md,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    name: {
        ...TYPOGRAPHY.h1,
        fontSize: 22,
        color: COLORS.text,
    },
    email: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: 4,
    },
    section: {
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: 16,
        marginHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionHeader: {
        ...TYPOGRAPHY.label,
        fontWeight: 'bold',
        color: COLORS.primary,
        paddingVertical: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.md,
        marginTop: SPACING.xl,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.error + '40',
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
    versionText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 12,
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl * 2,
    },
});

export default ProfileScreen;
