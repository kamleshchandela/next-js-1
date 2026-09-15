// ============================================================================
// 8. TERMINAL UI FORMATTING & HELPERS (ui.ts)
// Clean ANSI colors and visual layout helpers (Zero external dependencies)
// ============================================================================

import { BillDetails, CartItem, Customer, FoodItem } from "./types";
import { isMemberCustomer } from "./customer";
import { calculateItemTotal } from "./cart";

// ANSI escape codes for colors and formatting
export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Foreground colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// Helper to colorize text
export function color(text: string, c: keyof typeof colors): string {
  return `${colors[c]}${text}${colors.reset}`;
}

// Clear screen
export function clearScreen(): void {
  process.stdout.write("\x1b[2J\x1b[0;0H");
}

// Print decorative banners
export function printHeader(title: string): void {
  const line = "=".repeat(56);
  console.log(color(line, "cyan"));
  const padding = Math.max(0, Math.floor((56 - title.length) / 2));
  console.log(" ".repeat(padding) + color(title, "bold"));
  console.log(color(line, "cyan"));
}

export function printSubheader(title: string): void {
  console.log("\n" + color(`--- ${title} ---`, "yellow"));
}

export function printSuccess(msg: string): void {
  console.log(color(`✔ ${msg}`, "green"));
}

export function printError(msg: string): void {
  console.log(color(`✖ ${msg}`, "red"));
}

export function printWarning(msg: string): void {
  console.log(color(`⚠ ${msg}`, "yellow"));
}

export function printInfo(msg: string): void {
  console.log(color(`ℹ ${msg}`, "blue"));
}

// Display Food Menu in a clear, aligned format
export function displayMenu(items: FoodItem[], categoryFilter?: string): void {
  printHeader("🍕 🍔 FOOD ORDERING MENU 🍰 ☕");

  if (categoryFilter) {
    console.log(color(`Filtering by Category: ${categoryFilter.toUpperCase()}`, "magenta"));
  }

  console.log(color("ID  | Item Name                     | Category | Price   | Status", "bold"));
  console.log(color("----+-------------------------------+----------+---------+-------------", "gray"));

  items.forEach((item: FoodItem) => {
    const idStr = item.id.toString().padEnd(3);
    const nameStr = item.name.padEnd(29);
    const catStr = item.category.padEnd(8);
    const priceStr = `₹${item.price}`.padEnd(7);
    const statusStr = item.isAvailable
      ? color("Available", "green")
      : color("Out of Stock", "red");

    console.log(`${idStr} | ${nameStr} | ${catStr} | ${priceStr} | ${statusStr}`);
  });
  console.log(color("----------------------------------------------------------------", "gray"));
}

// Display Cart Items
export function displayCart(cart: CartItem[]): void {
  printHeader("🛒 YOUR SHOPPING CART");

  if (cart.length === 0) {
    console.log(color("Your cart is currently empty. Add some tasty items!", "yellow"));
    return;
  }

  console.log(color("ID  | Item Name                  | Price   | Qty | Total   | Instruction", "bold"));
  console.log(color("----+----------------------------+---------+-----+---------+--------------------", "gray"));

  let totalQty = 0;
  cart.forEach((item: CartItem) => {
    const itemTotal = calculateItemTotal(item);
    totalQty += item.quantity;
    const idStr = item.id.toString().padEnd(3);
    const nameStr = item.name.padEnd(26);
    const priceStr = `₹${item.price}`.padEnd(7);
    const qtyStr = `x${item.quantity}`.padEnd(3);
    const totalStr = `₹${itemTotal}`.padEnd(7);
    const instruction = item.specialInstruction ? `(${item.specialInstruction})` : "-";

    console.log(`${idStr} | ${nameStr} | ${priceStr} | ${qtyStr} | ${totalStr} | ${instruction}`);
  });

  console.log(color("----------------------------------------------------------------------------", "gray"));
  console.log(color(`Total Items in Cart: ${totalQty}`, "cyan"));
}

// Display Bill Summary (Matching the exact assignment specifications)
export function displayBill(bill: BillDetails): void {
  console.log("\n" + color("========================================", "green"));
  console.log(color("             ORDER SUMMARY              ", "bold"));
  console.log(color("========================================", "green"));

  // Customer Details
  console.log(`Customer: ${color(bill.customer.name, "bold")}`);
  console.log(`Address:  ${bill.customer.address}`);
  if (bill.customer.phone) {
    console.log(`Phone:    ${bill.customer.phone}`);
  }

  if (isMemberCustomer(bill.customer)) {
    const levelColored = color(
      bill.customer.membershipLevel.toUpperCase(),
      bill.customer.membershipLevel === "platinum" ? "magenta" : "yellow"
    );
    console.log(`Membership: ${levelColored} (${bill.customer.discountPercentage}% discount)`);
    console.log(`Member ID:  ${bill.customer.membershipId}`);
  } else {
    console.log(`Customer Type: Guest (No membership discount)`);
  }

  console.log(`Order ID:   #${bill.orderId}`);
  console.log(`Date:       ${bill.orderDate}`);

  // Items List
  console.log("\nItems:");
  console.log(color("----------------------------------------", "gray"));
  bill.items.forEach((item: CartItem) => {
    const name = item.name.padEnd(22);
    const qty = `x${item.quantity}`.padEnd(6);
    const price = `₹${calculateItemTotal(item)}`.padStart(10);
    console.log(`${name} ${qty} ${price}`);
    if (item.specialInstruction) {
      console.log(`  ${color(`Note: ${item.specialInstruction}`, "dim")}`);
    }
  });
  console.log(color("----------------------------------------", "gray"));

  // Pricing Details
  console.log(`Subtotal:                       ₹${bill.subtotal.toFixed(2)}`);

  if (bill.membershipDiscount > 0) {
    console.log(color(`Membership Discount:           -₹${bill.membershipDiscount.toFixed(2)}`, "green"));
  } else {
    console.log(`Membership Discount:            ₹0.00`);
  }

  if (bill.additionalDiscount > 0) {
    console.log(color(`Additional Discount (>₹2000):   -₹${bill.additionalDiscount.toFixed(2)} (5%)`, "green"));
  } else {
    console.log(`Additional Discount:            ₹0.00`);
  }

  console.log(`Amount After Discount:          ₹${bill.amountAfterDiscount.toFixed(2)}`);
  console.log(`GST (5%):                       ₹${bill.tax.toFixed(2)}`);
  console.log(color("----------------------------------------", "gray"));
  console.log(color(`Final Amount:                   ₹${bill.finalAmount.toFixed(2)}`, "bold"));

  // Payment Details (Narrowing demonstration in UI)
  console.log(`\nPayment Method: ${color(bill.payment.method.toUpperCase(), "cyan")}`);
  if (bill.payment.method === "cash") {
    console.log(`Cash Received:  ₹${bill.payment.receivedAmount.toFixed(2)}`);
  } else if (bill.payment.method === "card") {
    console.log(`Card Number:    Ending in **** ${bill.payment.last4Digits}`);
  } else if (bill.payment.method === "upi") {
    console.log(`Transaction ID: ${bill.payment.transactionId}`);
  }

  console.log(`Order Status:   ${color(bill.status.toUpperCase(), "green")}`);
  console.log(color("========================================", "green"));
  console.log(color("        Thank you for ordering!         ", "bold"));
  console.log(color("========================================\n", "green"));
}
