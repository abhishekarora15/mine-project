import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],
    restaurant: null,
    deliveryFee: 40,
    taxRate: 0.05, // 5%

    addItem: (product, restaurant) => {
        const { items, restaurant: currentRestaurant } = get();

        // If adding item from a different restaurant, clear cart first
        if (currentRestaurant && currentRestaurant._id !== restaurant._id) {
            set({ items: [{ ...product, quantity: 1 }], restaurant });
            return;
        }

        const existingItem = items.find(item => item._id === product._id);
        if (existingItem) {
            set({
                items: items.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                ),
                restaurant,
            });
        } else {
            set({ items: [...items, { ...product, quantity: 1 }], restaurant });
        }
    },

    updateQuantity: (productId, delta) => {
        const { items } = get();
        const updatedItems = items.map(item => {
            if (item._id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);

        set({
            items: updatedItems,
            restaurant: updatedItems.length === 0 ? null : get().restaurant
        });
    },

    removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item._id !== productId);
        set({
            items: updatedItems,
            restaurant: updatedItems.length === 0 ? null : get().restaurant
        });
    },

    clearCart: () => set({ items: [], restaurant: null }),

    getBillDetails: () => {
        const { items, deliveryFee, taxRate } = get();
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const tax = subtotal * taxRate;
        const total = subtotal + tax + (subtotal > 0 ? deliveryFee : 0);

        return {
            subtotal,
            tax,
            deliveryFee: subtotal > 0 ? deliveryFee : 0,
            total
        };
    },

    getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}));

export default useCartStore;
