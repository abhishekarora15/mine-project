import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],
    restaurant: null,

    addItem: (product, restaurant) => {
        const { items, restaurant: currentRestaurant } = get();

        // If adding item from a different restaurant, clear cart first (typical food app behavior)
        if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
            set({ items: [{ ...product, quantity: 1 }], restaurant });
            return;
        }

        const existingItem = items.find(item => item.id === product.id);
        if (existingItem) {
            set({
                items: items.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ),
                restaurant,
            });
        } else {
            set({ items: [...items, { ...product, quantity: 1 }], restaurant });
        }
    },

    removeItem: (productId) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === productId);

        if (existingItem?.quantity === 1) {
            set({ items: items.filter(item => item.id !== productId) });
            if (items.length === 1) set({ restaurant: null });
        } else {
            set({
                items: items.map(item =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                ),
            });
        }
    },

    clearCart: () => set({ items: [], restaurant: null }),

    getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}));

export default useCartStore;
