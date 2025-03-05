"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = exports.calculateTotalSavings = exports.calculateCartTotal = exports.calculateDiscountedPrice = void 0;
/**
 * Calculate the discounted price of a product
 * @param product Product with potential discount information
 * @returns The final price after discount
 */
var calculateDiscountedPrice = function (product) {
    if (!product.Discount || product.Discount.length === 0) {
        return product.price;
    }
    var discount = product.Discount[0];
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
var calculateCartTotal = function (items) {
    return items.reduce(function (total, item) {
        var itemPrice = (0, exports.calculateDiscountedPrice)(item.product);
        return total + itemPrice * item.quantity;
    }, 0);
};
exports.calculateCartTotal = calculateCartTotal;
/**
 * Calculate the total savings from discounts in the cart
 * @param items Array of cart items
 * @returns Total amount saved from all discounts
 */
var calculateTotalSavings = function (items) {
    return items.reduce(function (savings, item) {
        if (!item.product.Discount || item.product.Discount.length === 0) {
            return savings;
        }
        var originalPrice = item.product.price;
        var discountedPrice = (0, exports.calculateDiscountedPrice)(item.product);
        var itemSavings = (originalPrice - discountedPrice) * item.quantity;
        return savings + itemSavings;
    }, 0);
};
exports.calculateTotalSavings = calculateTotalSavings;
/**
 * Format a price in Rupiah
 * @param price Number to format
 * @returns Formatted price string
 */
var formatPrice = function (price) {
    return "Rp.".concat(price.toLocaleString("id-ID"));
};
exports.formatPrice = formatPrice;
