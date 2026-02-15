const DeliveryProfile = require('../models/DeliveryProfile');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

/**
 * Assigns the nearest available delivery partner to an order.
 * @param {string} orderId - The ID of the order to assign.
 * @returns {Promise<Object|null>} - The assigned partner profile or null if none available.
 */
exports.assignDeliveryPartner = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('restaurantId');
        if (!order || !order.restaurantId) return null;

        const restaurantLocation = order.restaurantId.location.coordinates;

        // Find 10 nearest available partners within 10km
        const potentialPartners = await DeliveryProfile.find({
            isAvailable: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: restaurantLocation
                    },
                    $maxDistance: 10000 // 10km
                }
            }
        }).limit(10);

        for (const partnerProfile of potentialPartners) {
            // Atomic update to prevent race conditions
            const assignedPartner = await DeliveryProfile.findOneAndUpdate(
                { _id: partnerProfile._id, isAvailable: true },
                { isAvailable: false },
                { new: true }
            );

            if (assignedPartner) {
                // Update order with partner ID
                await Order.findByIdAndUpdate(orderId, {
                    deliveryPartnerId: assignedPartner.userId,
                    orderStatus: 'confirmed' // Ensure it's confirmed if not already
                });

                console.log(`Order ${orderId} assigned to partner ${assignedPartner.userId}`);
                return assignedPartner;
            }
        }

        console.log(`No available delivery partner found for order ${orderId}`);
        return null;
    } catch (error) {
        console.error('Error in assignDeliveryPartner:', error);
        return null;
    }
};
