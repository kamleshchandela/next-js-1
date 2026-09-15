// ============================================================================
// 7. ORDER MANAGEMENT & HISTORY (order.ts)
// ============================================================================

import { OrderStatus, BillDetails, assertNever } from "./types";

// In-memory order history list (Bonus / Additional Feature)
const orderHistory: BillDetails[] = [];

// Helper function to validate and update order status
export function updateOrderStatus(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { success: boolean; message: string; updatedStatus: OrderStatus } {
  // Exhaustive check demonstration on valid status transition description
  let statusDescription = "";

  switch (newStatus) {
    case "pending":
      statusDescription = "Order is received and awaiting confirmation.";
      break;
    case "confirmed":
      statusDescription = "Order has been accepted by the kitchen.";
      break;
    case "preparing":
      statusDescription = "Chef is preparing your delicious meal.";
      break;
    case "delivered":
      statusDescription = "Order has been delivered to your table / doorstep!";
      break;
    case "cancelled":
      statusDescription = "Order was cancelled.";
      break;
    default:
      return assertNever(newStatus);
  }

  return {
    success: true,
    message: `Order status changed from [${currentStatus.toUpperCase()}] to [${newStatus.toUpperCase()}]. ${statusDescription}`,
    updatedStatus: newStatus,
  };
}

// Save completed order to Order History (Additional Feature)
export function saveOrderToHistory(order: BillDetails): void {
  orderHistory.push(order);
}

// Get all past orders
export function getOrderHistory(): BillDetails[] {
  return [...orderHistory];
}

// Find order by ID
export function findOrderById(orderId: string): BillDetails | undefined {
  return orderHistory.find((order: BillDetails): boolean => order.orderId === orderId);
}
