import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Search, MapPin, Navigation, X, Clock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import useLocationStore from '../store/locationStore';

const LocationPickerModal = ({ visible, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { searchLocations, fetchLocation, setManualLocation } = useLocationStore();

    const handleSearch = async (text) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);
            const data = await searchLocations(text);
            setResults(data);
            setIsSearching(false);
        } else {
            setResults([]);
        }
    };

    const handleSelectLocation = (result) => {
        setManualLocation(result.description, result.coords);
        onClose();
    };

    const handleUseCurrentLocation = async () => {
        await fetchLocation();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Location</Text>
                </View>

                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Search size={20} color={COLORS.textLight} />
                        <TextInput
                            placeholder="Search for area, street name..."
                            placeholderTextColor={COLORS.textLight}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.currentLocationRow}
                    onPress={handleUseCurrentLocation}
                >
                    <Navigation size={20} color={COLORS.primary} />
                    <View style={styles.currentLocationContent}>
                        <Text style={styles.currentLocationTitle}>Use current location</Text>
                        <Text style={styles.currentLocationSubtitle}>Using GPS</Text>
                    </View>
                </TouchableOpacity>

                {isSearching ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.resultItem}
                                onPress={() => handleSelectLocation(item)}
                            >
                                <MapPin size={20} color={COLORS.textLight} />
                                <View style={styles.resultTextContainer}>
                                    <Text style={styles.resultTitle} numberOfLines={1}>
                                        {item.description.split(',')[0]}
                                    </Text>
                                    <Text style={styles.resultSubtitle} numberOfLines={1}>
                                        {item.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            searchQuery.length > 2 ? (
                                <Text style={styles.emptyText}>No results found</Text>
                            ) : null
                        }
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    closeBtn: {
        marginRight: SPACING.md,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
    },
    searchSection: {
        padding: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: SPACING.sm,
        color: COLORS.text,
        fontSize: 16,
    },
    currentLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    currentLocationContent: {
        marginLeft: SPACING.md,
    },
    currentLocationTitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    currentLocationSubtitle: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    resultTextContainer: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    resultTitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontWeight: '600',
    },
    resultSubtitle: {
        ...TYPOGRAPHY.label,
        color: COLORS.textLight,
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: 40,
    }
});

export default LocationPickerModal;
