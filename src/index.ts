// ============================================================================
// 9. MAIN APPLICATION (index.ts)
// Interactive Terminal Food Ordering & Billing System
// ============================================================================

import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import {
  CartItem,
  Customer,
  FoodCategory,
  FoodItem,
  MembershipLevel,
  OrderStatus,
  Payment,
  BillDetails,
} from "./types";
import { foodItems } from "./data";
import {
  createGuestCustomer,
  createMemberCustomer,
  isMemberCustomer,
} from "./customer";
import {
  addToCart,
  calculateSubtotal,
  removeFromCart,
  updateQuantity,
} from "./cart";
import {
  calculateDiscount,
  calculateFinalAmount,
  calculateTax,
  generateBill,
} from "./billing";
import {
  createCardPayment,
  createCashPayment,
  createUpiPayment,
  processPayment,
} from "./payment";
import {
  getOrderHistory,
  saveOrderToHistory,
  updateOrderStatus,
} from "./order";
import {
  color,
  displayBill,
  displayCart,
  displayMenu,
  printError,
  printHeader,
  printInfo,
  printSubheader,
  printSuccess,
  printWarning,
} from "./ui";

// Active State
let currentCustomer: Customer = createGuestCustomer(1, "Guest User", "Dine-In");
let cart: CartItem[] = [];
let lastOrderId = 1000;
let lastPlacedOrder: BillDetails | null = null; // for quick status updates of the recent order

// Create readline interface for terminal input
const rl = readline.createInterface({ input, output });

// Helper to ask a question
async function askQuestion(query: string): Promise<string> {
  const answer = await rl.question(color(query, "bold"));
  return answer.trim();
}

// ----------------------------------------------------------------------------
// HANDLER: View Menu
// ----------------------------------------------------------------------------
async function handleViewMenu(): Promise<void> {
  printSubheader("Filter Menu Option");
  console.log("1. View All Items");
  console.log("2. Filter by Category (pizza, burger, drink, dessert)");
  const choice = await askQuestion("\nEnter choice (1 or 2): ");

  if (choice === "2") {
    const cat = await askQuestion("Enter category (pizza / burger / drink / dessert): ");
    const validCats: FoodCategory[] = ["pizza", "burger", "drink", "dessert"];
    const lowerCat = cat.toLowerCase() as FoodCategory;

    if (validCats.includes(lowerCat)) {
      const filtered = foodItems.filter((item: FoodItem) => item.category === lowerCat);
      displayMenu(filtered, lowerCat);
    } else {
      printError("Invalid category! Showing all items instead.");
      displayMenu(foodItems);
    }
  } else {
    displayMenu(foodItems);
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Create / Select Customer
// ----------------------------------------------------------------------------
async function handleCreateCustomer(): Promise<void> {
  printHeader("👤 CUSTOMER SETUP");
  console.log("1. Guest Customer (0% discount)");
  console.log("2. Member Customer (Silver: 5%, Gold: 10%, Platinum: 15%)");

  const typeChoice = await askQuestion("\nChoose customer type (1 or 2): ");
  const name = (await askQuestion("Enter customer name: ")) || "Customer";
  const address = (await askQuestion("Enter address/table: ")) || "Table 1";
  const phone = await askQuestion("Enter phone number (optional, press Enter to skip): ");

  if (typeChoice === "2") {
    console.log("\nSelect Membership Tier:");
    console.log("1. Silver (5% discount)");
    console.log("2. Gold (10% discount)");
    console.log("3. Platinum (15% discount)");
    const tierChoice = await askQuestion("Enter tier (1, 2, or 3): ");

    let level: MembershipLevel = "silver";
    if (tierChoice === "2") level = "gold";
    if (tierChoice === "3") level = "platinum";

    currentCustomer = createMemberCustomer(
      Date.now(),
      name,
      address,
      level,
      phone || undefined
    );
    printSuccess(`Member customer created! Tier: ${level.toUpperCase()} (${currentCustomer.discountPercentage}% discount)`);
  } else {
    currentCustomer = createGuestCustomer(
      Date.now(),
      name,
      address,
      phone || undefined
    );
    printSuccess("Guest customer profile created!");
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Add Item to Cart
// ----------------------------------------------------------------------------
async function handleAddToCart(): Promise<void> {
  displayMenu(foodItems);
  const idInput = await askQuestion("\nEnter Food Item ID to add: ");
  const foodId = parseInt(idInput, 10);

  const foundItem = foodItems.find((item: FoodItem) => item.id === foodId);
  if (!foundItem) {
    printError(`Food item with ID ${foodId} not found!`);
    return;
  }

  if (!foundItem.isAvailable) {
    printWarning(`Sorry, "${foundItem.name}" is currently OUT OF STOCK!`);
    return;
  }

  const qtyInput = await askQuestion(`Enter quantity for "${foundItem.name}" (default 1): `);
  const quantity = parseInt(qtyInput, 10) || 1;

  if (quantity <= 0) {
    printError("Quantity must be at least 1.");
    return;
  }

  const instruction = await askQuestion("Any special instruction? (optional, press Enter to skip): ");

  cart = addToCart(cart, foundItem, quantity, instruction || undefined);
  printSuccess(`Added ${quantity}x "${foundItem.name}" to your cart!`);
}

// ----------------------------------------------------------------------------
// HANDLER: View Cart
// ----------------------------------------------------------------------------
function handleViewCart(): void {
  displayCart(cart);
  if (cart.length > 0) {
    const subtotal = calculateSubtotal(cart);
    const discount = calculateDiscount(currentCustomer, subtotal);
    const tax = calculateTax(subtotal - discount.totalDiscount);
    const finalAmount = calculateFinalAmount(subtotal, discount.totalDiscount, tax);

    console.log(color(`Subtotal: ₹${subtotal.toFixed(2)}`, "bold"));
    if (discount.totalDiscount > 0) {
      console.log(color(`Estimated Discount: -₹${discount.totalDiscount.toFixed(2)}`, "green"));
    }
    console.log(color(`Estimated Tax (GST 5%): ₹${tax.toFixed(2)}`, "dim"));
    console.log(color(`Estimated Total: ₹${finalAmount.toFixed(2)}`, "cyan"));
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Update Item Quantity
// ----------------------------------------------------------------------------
async function handleUpdateQuantity(): Promise<void> {
  if (cart.length === 0) {
    printWarning("Your cart is empty!");
    return;
  }

  displayCart(cart);
  const idInput = await askQuestion("\nEnter Food Item ID to update: ");
  const foodId = parseInt(idInput, 10);

  const itemInCart = cart.find((item: CartItem) => item.id === foodId);
  if (!itemInCart) {
    printError(`Item with ID ${foodId} is not in your cart.`);
    return;
  }

  const qtyInput = await askQuestion(`Enter new quantity for "${itemInCart.name}" (0 to remove): `);
  const newQty = parseInt(qtyInput, 10);

  if (isNaN(newQty) || newQty < 0) {
    printError("Please enter a valid non-negative number.");
    return;
  }

  cart = updateQuantity(cart, foodId, newQty);
  if (newQty === 0) {
    printSuccess(`Removed "${itemInCart.name}" from your cart.`);
  } else {
    printSuccess(`Updated "${itemInCart.name}" quantity to ${newQty}.`);
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Remove Item from Cart
// ----------------------------------------------------------------------------
async function handleRemoveItem(): Promise<void> {
  if (cart.length === 0) {
    printWarning("Your cart is empty!");
    return;
  }

  displayCart(cart);
  const idInput = await askQuestion("\nEnter Food Item ID to remove: ");
  const foodId = parseInt(idInput, 10);

  const exists = cart.some((item: CartItem) => item.id === foodId);
  if (!exists) {
    printError(`Item with ID ${foodId} is not in your cart.`);
    return;
  }

  cart = removeFromCart(cart, foodId);
  printSuccess(`Item #${foodId} removed from cart.`);
}

// ----------------------------------------------------------------------------
// HANDLER: Checkout, Payment & Billing
// ----------------------------------------------------------------------------
async function handleCheckout(): Promise<void> {
  if (cart.length === 0) {
    printError("Cannot checkout! Your cart is empty.");
    return;
  }

  const subtotal = calculateSubtotal(cart);
  const discounts = calculateDiscount(currentCustomer, subtotal);
  const afterDiscount = subtotal - discounts.totalDiscount;
  const tax = calculateTax(afterDiscount);
  const finalAmount = calculateFinalAmount(subtotal, discounts.totalDiscount, tax);

  printHeader("💳 CHECKOUT & PAYMENT");
  console.log(`Customer: ${currentCustomer.name} (${isMemberCustomer(currentCustomer) ? currentCustomer.membershipLevel.toUpperCase() : "Guest"})`);
  console.log(`Subtotal:            ₹${subtotal.toFixed(2)}`);
  console.log(`Discounts:          -₹${discounts.totalDiscount.toFixed(2)}`);
  console.log(`GST (5%):           +₹${tax.toFixed(2)}`);
  console.log(color(`Amount Payable:      ₹${finalAmount.toFixed(2)}`, "bold"));

  console.log("\nSelect Payment Method:");
  console.log("1. Cash");
  console.log("2. Card (Debit / Credit)");
  console.log("3. UPI (Google Pay, PhonePe, Paytm)");

  const payChoice = await askQuestion("\nEnter payment method (1, 2, or 3): ");
  let paymentObj: Payment;

  if (payChoice === "1") {
    const cashStr = await askQuestion(`Enter cash amount given by customer (minimum ₹${finalAmount.toFixed(2)}): `);
    const cashGiven = parseFloat(cashStr);
    if (isNaN(cashGiven)) {
      printError("Invalid cash amount.");
      return;
    }
    paymentObj = createCashPayment(cashGiven);
  } else if (payChoice === "2") {
    const digits = await askQuestion("Enter last 4 digits of your card: ");
    if (digits.length !== 4 || isNaN(Number(digits))) {
      printError("Invalid card number. Must be exactly 4 digits.");
      return;
    }
    paymentObj = createCardPayment(digits);
  } else if (payChoice === "3") {
    const txnId = await askQuestion("Enter UPI Transaction Reference ID: ");
    if (!txnId.trim()) {
      printError("Transaction ID cannot be empty.");
      return;
    }
    paymentObj = createUpiPayment(txnId.trim());
  } else {
    printError("Invalid payment method selected.");
    return;
  }

  // Process payment using type narrowing
  const paymentResult = processPayment(paymentObj, finalAmount);
  if (!paymentResult.success) {
    printError(paymentResult.message);
    return;
  }

  printSuccess(paymentResult.message);
  printInfo(paymentResult.summary);

  // Generate Bill using Discriminated Union
  lastOrderId += 1;
  const newOrderId = `ORD-${lastOrderId}`;
  const billResult = generateBill(newOrderId, currentCustomer, cart, paymentObj, "confirmed");

  // Type narrowing on discriminated union 'status'
  if (billResult.status === "success") {
    printSuccess("Order placed successfully!");
    displayBill(billResult.bill);
    saveOrderToHistory(billResult.bill);
    lastPlacedOrder = billResult.bill;
    cart = []; // clear cart after successful order
  } else {
    printError(`Billing Error: ${billResult.message}`);
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Update Order Status
// ----------------------------------------------------------------------------
async function handleUpdateOrderStatus(): Promise<void> {
  printHeader("📦 UPDATE ORDER STATUS");

  if (!lastPlacedOrder) {
    printWarning("No active order found in this session. Please place an order first!");
    return;
  }

  console.log(`Current Order: #${lastPlacedOrder.orderId}`);
  console.log(`Current Status: ${color(lastPlacedOrder.status.toUpperCase(), "cyan")}`);

  console.log("\nSelect New Status:");
  console.log("1. pending");
  console.log("2. confirmed");
  console.log("3. preparing");
  console.log("4. delivered");
  console.log("5. cancelled");

  const statusChoice = await askQuestion("\nEnter choice (1 to 5): ");
  let newStatus: OrderStatus;

  switch (statusChoice) {
    case "1":
      newStatus = "pending";
      break;
    case "2":
      newStatus = "confirmed";
      break;
    case "3":
      newStatus = "preparing";
      break;
    case "4":
      newStatus = "delivered";
      break;
    case "5":
      newStatus = "cancelled";
      break;
    default:
      printError("Invalid status choice!");
      return;
  }

  const result = updateOrderStatus(lastPlacedOrder.status, newStatus);
  if (result.success) {
    lastPlacedOrder.status = result.updatedStatus;
    printSuccess(result.message);
  }
}

// ----------------------------------------------------------------------------
// HANDLER: Order History (Bonus Feature)
// ----------------------------------------------------------------------------
function handleOrderHistory(): void {
  printHeader("📜 ORDER HISTORY");
  const history = getOrderHistory();

  if (history.length === 0) {
    console.log(color("No past orders found in this session.", "yellow"));
    return;
  }

  console.log(color("Order ID    | Date & Time           | Customer     | Items | Total Amount | Status", "bold"));
  console.log(color("------------+-----------------------+--------------+-------+--------------+-------------", "gray"));

  history.forEach((order) => {
    const id = order.orderId.padEnd(11);
    const date = order.orderDate.padEnd(21);
    const cust = order.customer.name.slice(0, 12).padEnd(12);
    const itemsCount = `${order.items.length} items`.padEnd(5);
    const total = `₹${order.finalAmount.toFixed(2)}`.padEnd(12);
    const status = color(order.status.toUpperCase(), "green");

    console.log(`${id} | ${date} | ${cust} | ${itemsCount} | ${total} | ${status}`);
  });
}

// ----------------------------------------------------------------------------
// MAIN INTERACTIVE LOOP
// ----------------------------------------------------------------------------
async function main(): Promise<void> {
  let isRunning = true;

  while (isRunning) {
    printHeader("🍔 FOOD ORDERING & BILLING SYSTEM 🍕");
    console.log(
      `Current Customer: ${color(currentCustomer.name, "cyan")} ` +
      `[${isMemberCustomer(currentCustomer) ? color(currentCustomer.membershipLevel.toUpperCase(), "yellow") : "Guest"}] | ` +
      `Cart Items: ${color(cart.length.toString(), "bold")}`
    );
    console.log(color("--------------------------------------------------------", "gray"));
    console.log("  1. 🍕 View Food Menu");
    console.log("  2. 👤 Create / Select Customer");
    console.log("  3. ➕ Add Food Item to Cart");
    console.log("  4. 🛒 View Cart & Estimates");
    console.log("  5. ✏️  Update Item Quantity in Cart");
    console.log("  6. ❌ Remove Item from Cart");
    console.log("  7. 💳 Checkout & Generate Bill");
    console.log("  8. 📦 Change Order Status");
    console.log("  9. 📜 View Order History (Bonus Feature)");
    console.log(" 10. 🚪 Exit Application");
    console.log(color("--------------------------------------------------------", "gray"));

    const option = await askQuestion("Select an option (1-10): ");

    console.log(""); // blank line for spacing

    switch (option) {
      case "1":
        await handleViewMenu();
        break;
      case "2":
        await handleCreateCustomer();
        break;
      case "3":
        await handleAddToCart();
        break;
      case "4":
        handleViewCart();
        break;
      case "5":
        await handleUpdateQuantity();
        break;
      case "6":
        await handleRemoveItem();
        break;
      case "7":
        await handleCheckout();
        break;
      case "8":
        await handleUpdateOrderStatus();
        break;
      case "9":
        handleOrderHistory();
        break;
      case "10":
        printInfo("Thank you for using Food Ordering System. Goodbye! 👋");
        isRunning = false;
        break;
      default:
        printError("Invalid option! Please enter a number between 1 and 10.");
        break;
    }

    if (isRunning) {
      console.log("");
      await askQuestion("Press ENTER to return to main menu...");
      console.log("\n".repeat(2));
    }
  }

  rl.close();
}

// Start the application
main().catch((err: unknown) => {
  console.error("An unexpected error occurred:", err);
  rl.close();
});
