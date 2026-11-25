import type { OrderStatus } from "@prisma/client";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  IN_PRODUCTION: "In production",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** Tile colour per status, drawn from the brand palette. */
export const STATUS_TINT: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "#f9e88d",
  PAID: "#d6ef78",
  IN_PRODUCTION: "#cfe0fa",
  SHIPPED: "#f8bbd1",
  DELIVERED: "#d6ef78",
  CANCELLED: "#e8dcc4",
};

export const ALL_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
