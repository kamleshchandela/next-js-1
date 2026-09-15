// ============================================================================
// AUTOMATED TEST / VERIFICATION SUITE (verify.ts)
// ============================================================================

import { foodItems } from "./data";
import { createGuestCustomer, createMemberCustomer, isMemberCustomer } from "./customer";
import { addToCart, calculateSubtotal, removeFromCart, updateQuantity } from "./cart";
import { calculateDiscount, calculateFinalAmount, calculateTax, generateBill } from "./billing";
import { createCardPayment, createCashPayment, createUpiPayment, processPayment } from "./payment";
import { getOrderHistory, saveOrderToHistory, updateOrderStatus } from "./order";
import { BillSuccess, CartItem } from "./types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`✔ PASS: ${msg}`);
}

console.log("\n--- RUNNING SYSTEM VERIFICATIONS ---\n");

// 1. Food items
assert(foodItems.length >= 8, `At least 8 food items exist (Found ${foodItems.length})`);
assert(foodItems.some((f) => f.category === "pizza"), "Pizza category exists");
assert(foodItems.some((f) => f.category === "burger"), "Burger category exists");
assert(foodItems.some((f) => f.category === "drink"), "Drink category exists");
assert(foodItems.some((f) => f.category === "dessert"), "Dessert category exists");

// 2. Customer Guest & Member
const guest = createGuestCustomer(1, "John Guest", "Table 4");
const memberSilver = createMemberCustomer(2, "Alice Silver", "Table 2", "silver");
const memberGold = createMemberCustomer(3, "Bob Gold", "Table 5", "gold");
const memberPlatinum = createMemberCustomer(4, "Charlie Plat", "Table 1", "platinum");

assert(!guest.isMember, "Guest is not a member");
assert(!isMemberCustomer(guest), "isMemberCustomer returns false for guest");
assert(memberSilver.discountPercentage === 5, "Silver discount is 5%");
assert(memberGold.discountPercentage === 10, "Gold discount is 10%");
assert(memberPlatinum.discountPercentage === 15, "Platinum discount is 15%");
assert(isMemberCustomer(memberGold), "isMemberCustomer returns true for member");

// 3. Cart Operations
let testCart: CartItem[] = [];
testCart = addToCart(testCart, foodItems[0], 2, "Extra cheese"); // Margherita 299 * 2 = 598
assert(testCart.length === 1, "Item added to cart");
assert(testCart[0].quantity === 2, "Item quantity is 2");
assert(testCart[0].specialInstruction === "Extra cheese", "Special instruction saved");

// Add more of same item
testCart = addToCart(testCart, foodItems[0], 1);
assert(testCart[0].quantity === 3, "Item quantity updated to 3");

// Add another item
testCart = addToCart(testCart, foodItems[3], 2); // Classic Veg Burger 149 * 2 = 298
assert(testCart.length === 2, "Second item added to cart");

// Update quantity
testCart = updateQuantity(testCart, foodItems[3].id, 1);
assert(testCart.find((i) => i.id === foodItems[3].id)?.quantity === 1, "Quantity updated to 1");

// Subtotal calculation
// Margherita (299 * 3 = 897) + Burger (149 * 1 = 149) = 1046
const subtotal1 = calculateSubtotal(testCart);
assert(subtotal1 === 1046, `Subtotal is correct: ${subtotal1} (Expected: 1046)`);

// 4. Discounts & Calculations (under 2000)
// For Gold Member (10% discount on 1046 = 104.60)
const discountGold = calculateDiscount(memberGold, subtotal1);
assert(discountGold.membershipDiscount === 104.6, `Gold discount: ${discountGold.membershipDiscount}`);
assert(discountGold.additionalDiscount === 0, `No additional discount under ₹2000`);

// Subtotal > 2000 Test
const bigSubtotal = 2500;
const bigDiscountGold = calculateDiscount(memberGold, bigSubtotal);
// 10% of 2500 = 250
assert(bigDiscountGold.membershipDiscount === 250, "Membership discount is 250");
// 5% additional of 2500 = 125
assert(bigDiscountGold.additionalDiscount === 125, "Additional 5% discount is 125");
assert(bigDiscountGold.totalDiscount === 375, "Total discount is 375");

// GST calculation: 5% of (2500 - 375 = 2125) = 106.25
const tax = calculateTax(bigSubtotal - bigDiscountGold.totalDiscount);
assert(tax === 106.25, `GST 5% is 106.25 (Calculated: ${tax})`);

// Final Amount
const finalAmt = calculateFinalAmount(bigSubtotal, bigDiscountGold.totalDiscount, tax);
assert(finalAmt === 2231.25, `Final amount is 2231.25 (Calculated: ${finalAmt})`);

// 5. Payment Processing with Narrowing
const cash = createCashPayment(2500);
const cashResult = processPayment(cash, finalAmt);
assert(cashResult.success, "Cash payment processed successfully");

const card = createCardPayment("4242");
const cardResult = processPayment(card, finalAmt);
assert(cardResult.success, "Card payment processed successfully");

const upi = createUpiPayment("UPI-TEST-123456");
const upiResult = processPayment(upi, finalAmt);
assert(upiResult.success, "UPI payment processed successfully");

// 6. Generate Bill (Discriminated Union)
const billRes = generateBill("ORD-TEST-1", memberGold, testCart, upi);
assert(billRes.status === "success", "Bill generated with success status");

if (billRes.status === "success") {
  const successBill: BillSuccess = billRes;
  assert(successBill.bill.orderId === "ORD-TEST-1", "Order ID matches");
  assert(successBill.bill.finalAmount > 0, "Final amount is positive");
  saveOrderToHistory(successBill.bill);
}

// 7. Order Status Update
const statusRes = updateOrderStatus("confirmed", "preparing");
assert(statusRes.success && statusRes.updatedStatus === "preparing", "Order status successfully transitioned to preparing");

// 8. Order History (Bonus)
const history = getOrderHistory();
assert(history.length === 1, "Order history recorded successfully");

console.log("\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!\n");
