import { create } from 'zustand';
import * as Location from 'expo-location';

const useLocationStore = create((set) => ({
    location: null,
    address: 'Fetching location...',
    error: null,
    loading: false,

    fetchLocation: async () => {
        set({ loading: true, error: null });
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                set({
                    error: 'Permission to access location was denied',
                    address: 'Location denied',
                    loading: false
                });
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            set({ location });

            // Reverse geocode to get address
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                const readableAddress = `${addr.name || addr.street || ''}, ${addr.district || addr.city || ''}`;
                set({ address: readableAddress, loading: false });
            } else {
                set({ address: 'Unknown location', loading: false });
            }
        } catch (err) {
            set({
                error: err.message,
                address: 'Error fetching location',
                loading: false
            });
        }
    },

    setManualLocation: (address, coords) => {
        set({ address, location: { coords }, loading: false });
    },

    searchLocations: async (query) => {
        if (!query) return [];
        try {
            const results = await Location.geocodeAsync(query);
            const detailedResults = await Promise.all(
                results.slice(0, 5).map(async (res) => {
                    const rev = await Location.reverseGeocodeAsync(res);
                    if (rev.length > 0) {
                        const addr = rev[0];
                        const readable = `${addr.name || addr.street || ''}, ${addr.district || addr.city || ''}`;
                        return {
                            description: readable,
                            coords: res,
                            fullAddress: addr
                        };
                    }
                    return null;
                })
            );
            return detailedResults.filter(r => r !== null);
        } catch (err) {
            console.error('Search error:', err);
            return [];
        }
    },
}));

export default useLocationStore;
