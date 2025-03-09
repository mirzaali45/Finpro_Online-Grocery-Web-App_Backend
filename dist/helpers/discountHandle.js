"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = exports.calculateTotalSavings = exports.calculateCartTotal = exports.calculateDiscountedPrice = void 0;
/**
 * Calculate the discounted price of a product
 * @param product Product with potential discount information
 * @returns The final price after discount
 */
const calculateDiscountedPrice = (product) => {
    if (!product.Discount || product.Discount.length === 0) {
        return product.price;
    }
    const discount = product.Discount[0];
    if (discount.discount_type === "percentage") {
        return (product.price -
            Math.floor((product.price * discount.discount_value) / 100));
    }
    else {
        return product.price - discount.discount_value;
    }
};
exports.calculateDiscountedPrice = calculateDiscountedPrice;
/**
 * Calculate the total price of the cart items including discounts
 * @param items Array of cart items
 * @returns Total price with discounts applied
 */
const calculateCartTotal = (items) => {
    return items.reduce((total, item) => {
        const itemPrice = (0, exports.calculateDiscountedPrice)(item.product);
        return total + itemPrice * item.quantity;
    }, 0);
};
exports.calculateCartTotal = calculateCartTotal;
/**
 * Calculate the total savings from discounts in the cart
 * @param items Array of cart items
 * @returns Total amount saved from all discounts
 */
const calculateTotalSavings = (items) => {
    return items.reduce((savings, item) => {
        if (!item.product.Discount || item.product.Discount.length === 0) {
            return savings;
        }
        const originalPrice = item.product.price;
        const discountedPrice = (0, exports.calculateDiscountedPrice)(item.product);
        const itemSavings = (originalPrice - discountedPrice) * item.quantity;
        return savings + itemSavings;
    }, 0);
};
exports.calculateTotalSavings = calculateTotalSavings;
/**
 * Format a price in Rupiah
 * @param price Number to format
 * @returns Formatted price string
 */
const formatPrice = (price) => {
    return `Rp.${price.toLocaleString("id-ID")}`;
};
exports.formatPrice = formatPrice;
