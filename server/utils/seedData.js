const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const seedData = async () => {
    try {
        // Clear existing data (Optional, handle with care)
        // await Restaurant.deleteMany({});
        // await MenuItem.deleteMany({});

        const restaurant = await Restaurant.create({
            name: 'The Burger Club',
            cuisineTypes: ['American', 'Burgers'],
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
            location: 'Dwarka Sector 12',
        });

        await MenuItem.create([
            {
                restaurantId: restaurant._id,
                name: 'Classic Veg Burger',
                price: 129,
                description: 'Single veg patty, cheese, onion, tomato',
                category: 'Best Sellers',
                isVeg: true,
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349'
            },
            {
                restaurantId: restaurant._id,
                name: 'Peri Peri Fries',
                price: 99,
                description: 'Crispy fries with peri peri seasoning',
                category: 'Best Sellers',
                isVeg: true,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877'
            }
        ]);

        console.log('✅ Seed data created successfully');
        return { success: true };
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        return { success: false, message: err.message };
    }
};

module.exports = seedData;
