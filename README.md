# 🍔 Food Ordering & Billing System

A robust, type-safe, and interactive **Terminal-based Food Ordering and Billing System** crafted using modern **TypeScript**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero-Dependency Runtime](https://img.shields.io/badge/Dependencies-Zero%20Runtime-brightgreen.svg)]()

---

## 🌟 Highlights & Key Features

- **🍔 Interactive Terminal CLI**: Built-in visual menu system with ANSI colors, clean tables, and formatted receipts.
- **🍕 Comprehensive Menu & Categories**: Pizzas, burgers, drinks, and desserts with real-time stock availability handling.
- **👥 Customer Tiers & Loyalty**:
  - **Guest Customer**: Dine-in / Walk-in support.
  - **Member Customer**: Multi-tier discounts (Silver: 5%, Gold: 10%, Platinum: 15%).
- **🛒 Dynamic Cart Operations**: Add, update quantity, remove, and calculate real-time item totals and subtotal.
- **💰 Smart Billing & Tax Engine**:
  - Automated tier discounts.
  - Additional **5% bulk discount** for orders exceeding ₹2,000.
  - **5% GST calculation** applied post-discount.
- **💳 Multi-Mode Payment Processor**:
  - **Cash**: Automated cash change computation and shortage detection.
  - **Card**: Last 4 digits validation.
  - **UPI**: Transaction reference validation.
- **📦 Order Lifecycle & History**: Track status transitions (`pending` ➔ `confirmed` ➔ `preparing` ➔ `delivered` / `cancelled`) with full order history storage.
- **🛡️ 100% Strict Type Safety**:
  - Strict TypeScript (`noImplicitAny`, `strictNullChecks`).
  - **Zero `any`** types across the entire codebase.
  - Pure functional programming without classes.
  - Discriminated Unions, Intersection Types, Custom Type Guards, and Exhaustiveness Checking (`never`).

---

## 📂 Project Architecture

```text
food-ordering-system/
├── .editorconfig         # Code formatting consistency configuration
├── .gitattributes        # Cross-platform LF line ending normalization
├── .gitignore            # Git ignore rules (node_modules, dist, logs)
├── LICENSE               # MIT Open Source License
├── package.json          # Scripts, dependencies, and metadata
├── tsconfig.json         # Strict TypeScript compiler options
├── README.md             # Project overview and documentation
├── ASSIGNMENT_REQUIREMENTS.md # Original assignment checklist
└── src/
    ├── types.ts          # Core domain models, interfaces, unions, & type guards
    ├── data.ts           # Initial food catalog (10 items across 4 categories)
    ├── customer.ts       # Customer factories and membership tier helpers
    ├── cart.ts           # Pure functional cart operations (reduce, map, filter)
    ├── billing.ts        # Discount rules, GST computation, & BillResult generator
    ├── payment.ts        # Cash, Card, UPI payment validation & processor
    ├── order.ts          # Order status transitions & in-memory history
    ├── ui.ts             # ANSI terminal formatting, ASCII art, and receipt layout
    ├── index.ts          # Main interactive CLI application (Node.js readline loop)
    └── verify.ts         # Automated test suite covering all business rules
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` (bundled with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/food-ordering-system.git

# Navigate into the project directory
cd food-ordering-system

# Install dependencies
npm install
```

### Running the Application

| Command | Purpose |
| :--- | :--- |
| `npm start` | Launch the **Interactive Terminal Food Ordering System** |
| `npm run verify` | Run the **Automated Test Scenarios & Edge Cases** |
| `npm run typecheck` | Perform a strict **TypeScript compiler check** (`tsc --noEmit`) |
| `npm run build` | Compile TypeScript into production JavaScript in `dist/` |

---

## 🧩 TypeScript Architecture Deep Dive

This project demonstrates advanced TypeScript patterns without relying on classes:

### 1. Discriminated Unions (`BillResult`)
```typescript
export type BillSuccess = {
  status: "success";
  bill: BillDetails;
};

export type BillError = {
  status: "error";
  message: string;
};

export type BillResult = BillSuccess | BillError;
```

### 2. Intersection Types (`CartItem`)
```typescript
export type OrderItemDetails = {
  quantity: number;
  specialInstruction?: string;
};

// Merges FoodItem attributes with cart-specific order data
export type CartItem = FoodItem & OrderItemDetails;
```

### 3. Exhaustiveness Checking (`never`)
Ensures compile-time coverage for all payment types and order statuses:
```typescript
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

### 4. Custom Type Guards (`customer is MemberCustomer`)
```typescript
export function isMemberCustomer(customer: Customer): customer is MemberCustomer {
  return "membershipId" in customer && customer.isMember === true;
}
```

---

## 📸 Interactive Terminal Preview

```text
========================================================
          🍔 FOOD ORDERING & BILLING SYSTEM 🍕            
========================================================
Current Customer: Guest User [Guest] | Cart Items: 0
--------------------------------------------------------
  1. 🍕 View Food Menu       
  2. 👤 Create / Select Customer      
  3. ➕ Add Food Item to Cart
  4. 🛒 View Cart & Estimates   
  5. ✏️  Update Item Quantity in Cart
  6. ❌ Remove Item from Cart             
  7. 💳 Checkout & Generate Bill
  8. 📦 Change Order Status                              
  9. 📜 View Order History (Bonus Feature)
 10. 🚪 Exit Application
--------------------------------------------------------
```

---

## 🧪 Verification & Automated Tests

Run the test suite to verify all business rules, discount thresholds, GST computations, and edge cases:

```bash
npm run verify
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
