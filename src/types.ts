// ============================================================================
// 1. TYPES & INTERFACES (types.ts)
// ============================================================================

// Type Aliases for literal unions
export type ID = number;
export type FoodCategory = "pizza" | "burger" | "drink" | "dessert";
export type MembershipLevel = "silver" | "gold" | "platinum";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card" | "upi";

// 1. Food Item Interface
export interface FoodItem {
  id: number;
  name: string;
  category: FoodCategory;
  price: number;
  isAvailable: boolean;
}

// 2. Customer Interfaces & Union
export interface BaseCustomer {
  id: number;
  name: string;
  phone?: string;
  address: string;
}

export interface GuestCustomer extends BaseCustomer {
  isMember: false;
}

export interface MemberCustomer extends BaseCustomer {
  isMember: true;
  membershipId: string;
  membershipLevel: MembershipLevel;
  discountPercentage: number;
}

// Union type for Customer (Guest vs Member)
export type Customer = GuestCustomer | MemberCustomer;

// 3. Cart Types (Using Intersection Type &)
export type OrderItemDetails = {
  quantity: number;
  specialInstruction?: string;
};

// Intersection type: FoodItem + Order Information = CartItem
export type CartItem = FoodItem & OrderItemDetails;

// 4. Payment Types (Union type with different properties)
export type CashPayment = {
  method: "cash";
  receivedAmount: number;
};

export type CardPayment = {
  method: "card";
  last4Digits: string;
};

export type UpiPayment = {
  method: "upi";
  transactionId: string;
};

// Union type for Payments
export type Payment = CashPayment | CardPayment | UpiPayment;

// 5. Bill & Order Summary Types
export interface BillDetails {
  orderId: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  membershipDiscount: number;
  additionalDiscount: number;
  totalDiscount: number;
  amountAfterDiscount: number;
  tax: number;
  finalAmount: number;
  payment: Payment;
  status: OrderStatus;
  orderDate: string;
}

// Discriminated Union for Bill Result
export type BillSuccess = {
  status: "success";
  bill: BillDetails;
};

export type BillError = {
  status: "error";
  message: string;
};

export type BillResult = BillSuccess | BillError;

// 6. Exhaustiveness check function using 'never'
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
