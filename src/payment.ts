// ============================================================================
// 6. PAYMENT PROCESSING (payment.ts)
// ============================================================================

import {
  Payment,
  CashPayment,
  CardPayment,
  UpiPayment,
  assertNever,
} from "./types";

export interface PaymentProcessingResult {
  success: boolean;
  message: string;
  summary: string;
}

// Helper creators for payments
export function createCashPayment(receivedAmount: number): CashPayment {
  return {
    method: "cash",
    receivedAmount,
  };
}

export function createCardPayment(last4Digits: string): CardPayment {
  return {
    method: "card",
    last4Digits,
  };
}

export function createUpiPayment(transactionId: string): UpiPayment {
  return {
    method: "upi",
    transactionId,
  };
}

// Function: Process payment using TYPE NARROWING (using 'in' operator & equality check)
// and exhaustiveness checking using 'assertNever'
export function processPayment(
  payment: Payment,
  totalAmount: number
): PaymentProcessingResult {
  // Method 1: Narrowing by discriminated property equality check
  switch (payment.method) {
    case "cash": {
      // Type narrowed to CashPayment
      // We can also verify with 'in' operator
      if ("receivedAmount" in payment) {
        if (payment.receivedAmount < totalAmount) {
          const shortage = (totalAmount - payment.receivedAmount).toFixed(2);
          return {
            success: false,
            message: `Insufficient cash received! Shortage by ₹${shortage}`,
            summary: `Cash Received: ₹${payment.receivedAmount} (Needed ₹${totalAmount})`,
          };
        }
        const change = (payment.receivedAmount - totalAmount).toFixed(2);
        return {
          success: true,
          message: `Cash payment successful! Change to return: ₹${change}`,
          summary: `Cash Paid: ₹${payment.receivedAmount} | Change: ₹${change}`,
        };
      }
      return {
        success: false,
        message: "Invalid cash payment format.",
        summary: "Cash payment error",
      };
    }

    case "card": {
      // Type narrowed to CardPayment
      if ("last4Digits" in payment) {
        if (payment.last4Digits.length !== 4 || isNaN(Number(payment.last4Digits))) {
          return {
            success: false,
            message: "Invalid Card last 4 digits! Must be exactly 4 numeric digits.",
            summary: "Card error",
          };
        }
        return {
          success: true,
          message: `Card charged ₹${totalAmount.toFixed(2)} successfully!`,
          summary: `Card ending with **** **** **** ${payment.last4Digits}`,
        };
      }
      return {
        success: false,
        message: "Invalid card details.",
        summary: "Card error",
      };
    }

    case "upi": {
      // Type narrowed to UpiPayment
      if ("transactionId" in payment) {
        if (!payment.transactionId.trim()) {
          return {
            success: false,
            message: "Transaction ID cannot be empty!",
            summary: "UPI error",
          };
        }
        return {
          success: true,
          message: `UPI payment of ₹${totalAmount.toFixed(2)} verified successfully!`,
          summary: `UPI Txn Ref: ${payment.transactionId.trim()}`,
        };
      }
      return {
        success: false,
        message: "Invalid UPI details.",
        summary: "UPI error",
      };
    }

    default:
      // Exhaustiveness check using 'never'
      return assertNever(payment);
  }
}
