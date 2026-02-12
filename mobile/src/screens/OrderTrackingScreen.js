import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Phone, MessageSquare, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const OrderTrackingScreen = ({ navigation }) => {
    const steps = [
        { title: 'Order Placed', time: '12:45 PM', completed: true },
        { title: 'Preparing Food', time: '12:50 PM', completed: true },
        { title: 'Out for Delivery', time: 'Expected 1:15 PM', completed: false },
        { title: 'Delivered', time: '', completed: false },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Map Mockup */}
            <View style={styles.mapContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b' }}
                    style={styles.mapImage}
                />
                <View style={[styles.mapMarker, { top: '40%', left: '30%' }]}>
                    <MapPin size={32} color={COLORS.primary} fill="#FFF" />
                </View>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.deliveryInfo}>
                    <View>
                        <Text style={styles.arrivalTitle}>Arriving in 15 mins</Text>
                        <Text style={styles.deliveryStatus}>Your delivery partner is near you</Text>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79' }}
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.trackingSteps}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepIndicator}>
                                <View style={[styles.stepCircle, { backgroundColor: step.completed ? COLORS.success : '#CBD5E1' }]} />
                                {index !== steps.length - 1 && <View style={[styles.stepLine, { backgroundColor: step.completed ? COLORS.success : '#CBD5E1' }]} />}
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: step.completed ? COLORS.text : COLORS.textLight }]}>{step.title}</Text>
                                {step.time !== '' && <Text style={styles.stepTime}>{step.time}</Text>}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Phone size={20} color={COLORS.primary} />
                        <Text style={styles.actionBtnText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageSquare size={20} color={COLORS.primary} />
                        <Text style={styles.actionBtnText}>Message</Text>
                    </TouchableOpacity>
                </View>
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
        padding: SPACING.md,
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.text,
    },
    mapContainer: {
        height: '40%',
        position: 'relative',
        backgroundColor: '#000',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.4,
    },
    mapMarker: {
        position: 'absolute',
    },
    statusCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        padding: SPACING.lg,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    deliveryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    arrivalTitle: {
        ...TYPOGRAPHY.h1,
        fontSize: 22,
        color: COLORS.primary,
    },
    deliveryStatus: {
        ...TYPOGRAPHY.body,
        color: COLORS.textLight,
        marginTop: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    trackingSteps: {
        flex: 1,
    },
    stepRow: {
        flexDirection: 'row',
        height: 60,
    },
    stepIndicator: {
        alignItems: 'center',
        width: 30,
        marginRight: 15,
    },
    stepCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        zIndex: 1,
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginTop: -2,
        marginBottom: -2,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    stepTime: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        marginTop: 2,
        color: COLORS.textLight,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingTop: SPACING.lg,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        padding: 12,
        backgroundColor: 'transparent',
    },
    actionBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default OrderTrackingScreen;
