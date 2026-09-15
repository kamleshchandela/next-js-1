// ============================================================================
// 4. CART MANAGEMENT (cart.ts)
// ============================================================================

import { CartItem, FoodItem } from "./types";

// Function: Calculate single item total
export function calculateItemTotal(item: CartItem): number {
  return item.price * item.quantity;
}

// Function: Calculate overall cart subtotal using Array.prototype.reduce()
export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((total: number, item: CartItem): number => {
    return total + calculateItemTotal(item);
  }, 0);
}

// Function: Add item to cart
// If item already exists, increase quantity and optionally update instruction
export function addToCart(
  cart: CartItem[],
  food: FoodItem,
  quantity: number = 1,
  specialInstruction?: string
): CartItem[] {
  if (quantity <= 0) {
    return cart;
  }

  // Check if item is already in cart using Array.prototype.find()
  const existingItem = cart.find((item: CartItem): boolean => item.id === food.id);

  if (existingItem) {
    // Return updated cart using Array.prototype.map()
    return cart.map((item: CartItem): CartItem => {
      if (item.id === food.id) {
        return {
          ...item,
          quantity: item.quantity + quantity,
          specialInstruction: specialInstruction ?? item.specialInstruction,
        };
      }
      return item;
    });
  }

  // Create new CartItem using spread (combining FoodItem + OrderItemDetails)
  const newItem: CartItem = {
    ...food,
    quantity,
    specialInstruction,
  };

  return [...cart, newItem];
}

// Function: Update item quantity in cart
export function updateQuantity(
  cart: CartItem[],
  foodId: number,
  newQuantity: number
): CartItem[] {
  // If new quantity is 0 or negative, remove the item from cart
  if (newQuantity <= 0) {
    return removeFromCart(cart, foodId);
  }

  return cart.map((item: CartItem): CartItem => {
    if (item.id === foodId) {
      return {
        ...item,
        quantity: newQuantity,
      };
    }
    return item;
  });
}

// Function: Remove item from cart using Array.prototype.filter()
export function removeFromCart(cart: CartItem[], foodId: number): CartItem[] {
  return cart.filter((item: CartItem): boolean => item.id !== foodId);
}
