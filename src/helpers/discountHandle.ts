// Define needed types
type DiscountType = "point" | "percentage";

interface Discount {
  discount_id: number;
  discount_type: DiscountType;
  discount_value: number;
  expires_at: string;
  [key: string]: any; // For other potential properties
}

interface Product {
  product_id: number;
  price: number;
  Discount?: Discount[];
  [key: string]: any; // For other potential properties
}

interface CartItem {
  quantity: number;
  product: Product;
  [key: string]: any; // For other properties
}

/**
 * Calculate the discounted price of a product
 * @param product Product with potential discount information
 * @returns The final price after discount
 */
export const calculateDiscountedPrice = (product: Product): number => {
  if (!product.Discount || product.Discount.length === 0) {
    return product.price;
  }

  const discount = product.Discount[0];

  if (discount.discount_type === "percentage") {
    return (
      product.price -
      Math.floor((product.price * discount.discount_value) / 100)
    );
  } else {
    return product.price - discount.discount_value;
  }
};

/**
 * Calculate the total price of the cart items including discounts
 * @param items Array of cart items
 * @returns Total price with discounts applied
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total: number, item: CartItem) => {
    const itemPrice = calculateDiscountedPrice(item.product);
    return total + itemPrice * item.quantity;
  }, 0);
};

/**
 * Calculate the total savings from discounts in the cart
 * @param items Array of cart items
 * @returns Total amount saved from all discounts
 */
export const calculateTotalSavings = (items: CartItem[]): number => {
  return items.reduce((savings: number, item: CartItem) => {
    if (!item.product.Discount || item.product.Discount.length === 0) {
      return savings;
    }

    const originalPrice = item.product.price;
    const discountedPrice = calculateDiscountedPrice(item.product);
    const itemSavings = (originalPrice - discountedPrice) * item.quantity;

    return savings + itemSavings;
  }, 0);
};

/**
 * Format a price in Rupiah
 * @param price Number to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return `Rp.${price.toLocaleString("id-ID")}`;
};
