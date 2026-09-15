// ============================================================================
// 2. DATA (data.ts)
// Initial food menu items
// ============================================================================

import { FoodItem } from "./types";

// Minimum 8 items required by assignment (we provide 10 across all categories)
export const foodItems: FoodItem[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "pizza",
    price: 299,
    isAvailable: true,
  },
  {
    id: 2,
    name: "Farmhouse Deluxe Pizza",
    category: "pizza",
    price: 449,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Spicy Paneer Pizza",
    category: "pizza",
    price: 399,
    isAvailable: true,
  },
  {
    id: 4,
    name: "Classic Veg Burger",
    category: "burger",
    price: 149,
    isAvailable: true,
  },
  {
    id: 5,
    name: "Crispy Cheese Burger",
    category: "burger",
    price: 199,
    isAvailable: true,
  },
  {
    id: 6,
    name: "BBQ Grilled Burger",
    category: "burger",
    price: 229,
    isAvailable: true,
  },
  {
    id: 7,
    name: "Chilled Cold Coffee",
    category: "drink",
    price: 120,
    isAvailable: true,
  },
  {
    id: 8,
    name: "Fresh Lemon Mojito",
    category: "drink",
    price: 99,
    isAvailable: true,
  },
  {
    id: 9,
    name: "Chocolate Lava Cake",
    category: "dessert",
    price: 159,
    isAvailable: true,
  },
  {
    id: 10,
    name: "Warm Brownie with Fudge",
    category: "dessert",
    price: 179,
    isAvailable: false, // out of stock example
  },
];
