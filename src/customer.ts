// ============================================================================
// 3. CUSTOMER MANAGEMENT (customer.ts)
// ============================================================================

import { Customer, GuestCustomer, MemberCustomer, MembershipLevel } from "./types";

// Helper function to get discount percentage based on membership level
export function getMembershipDiscount(level: MembershipLevel): number {
  switch (level) {
    case "silver":
      return 5;
    case "gold":
      return 10;
    case "platinum":
      return 15;
    default:
      return 0;
  }
}

// Function to create a Guest Customer
export function createGuestCustomer(
  id: number,
  name: string,
  address: string,
  phone?: string
): GuestCustomer {
  return {
    id,
    name,
    address,
    phone,
    isMember: false,
  };
}

// Function to create a Member Customer
export function createMemberCustomer(
  id: number,
  name: string,
  address: string,
  membershipLevel: MembershipLevel,
  phone?: string
): MemberCustomer {
  const discountPercentage = getMembershipDiscount(membershipLevel);
  const membershipId = `MEM-${Date.now().toString().slice(-5)}`;

  return {
    id,
    name,
    address,
    phone,
    isMember: true,
    membershipId,
    membershipLevel,
    discountPercentage,
  };
}

// Type Narrowing function using 'in' operator to check if customer is a Member
export function isMemberCustomer(customer: Customer): customer is MemberCustomer {
  return "membershipId" in customer && customer.isMember === true;
}
