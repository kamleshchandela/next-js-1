// ============================================================================
// 5. BILLING & TAX CALCULATIONS (billing.ts)
// ============================================================================

import {
  BillResult,
  CartItem,
  Customer,
  OrderStatus,
  Payment,
} from "./types";
import { isMemberCustomer } from "./customer";
import { calculateSubtotal } from "./cart";

export interface DiscountBreakdown {
  membershipDiscount: number;
  additionalDiscount: number;
  totalDiscount: number;
}

// Function: Calculate membership discount and additional threshold discount
export function calculateDiscount(customer: Customer, subtotal: number): DiscountBreakdown {
  let membershipDiscountPercent = 0;

  // Type narrowing using our helper or 'in' operator
  if (isMemberCustomer(customer)) {
    membershipDiscountPercent = customer.discountPercentage;
  }

  // Calculate membership discount amount
  const membershipDiscount = (subtotal * membershipDiscountPercent) / 100;

  // Additional 5% discount if subtotal > 2000
  let additionalDiscount = 0;
  if (subtotal > 2000) {
    additionalDiscount = (subtotal * 5) / 100;
  }

  const totalDiscount = membershipDiscount + additionalDiscount;

  return {
    membershipDiscount: Number(membershipDiscount.toFixed(2)),
    additionalDiscount: Number(additionalDiscount.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
  };
}

// Function: Calculate GST (5% after all discounts)
export function calculateTax(amountAfterDiscount: number): number {
  const gstRate = 0.05; // 5% GST
  return Number((amountAfterDiscount * gstRate).toFixed(2));
}

// Function: Calculate Final Amount (Subtotal - Total Discount + Tax)
export function calculateFinalAmount(
  subtotal: number,
  totalDiscount: number,
  tax: number
): number {
  const finalAmount = subtotal - totalDiscount + tax;
  return Number(finalAmount.toFixed(2));
}

// Function: Generate Bill returning a Discriminated Union (BillResult)
export function generateBill(
  orderId: string,
  customer: Customer,
  items: CartItem[],
  payment: Payment,
  status: OrderStatus = "confirmed"
): BillResult {
  // Check if cart has items
  if (items.length === 0) {
    return {
      status: "error",
      message: "Cart is empty. Please add items before generating a bill.",
    };
  }

  const subtotal = calculateSubtotal(items);
  const discounts = calculateDiscount(customer, subtotal);
  const amountAfterDiscount = Number((subtotal - discounts.totalDiscount).toFixed(2));
  const tax = calculateTax(amountAfterDiscount);
  const finalAmount = calculateFinalAmount(subtotal, discounts.totalDiscount, tax);

  // Return success discriminated union
  return {
    status: "success",
    bill: {
      orderId,
      customer,
      items: [...items],
      subtotal,
      membershipDiscount: discounts.membershipDiscount,
      additionalDiscount: discounts.additionalDiscount,
      totalDiscount: discounts.totalDiscount,
      amountAfterDiscount,
      tax,
      finalAmount,
      payment,
      status,
      orderDate: new Date().toLocaleString(),
    },
  };
}
