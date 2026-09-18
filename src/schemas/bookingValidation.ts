/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";

// Phone validation regex supporting Uzbek and international formats:
// e.g. +998 90 123 45 67, 998901234567, 901234567, etc.
const phoneRegex = /^(\+?998)?[0-9\s\-()]{7,16}$/;

/**
 * Step 1: Route & Location Validation Schema
 */
export const RouteStepSchema = z.object({
  pickup: z
    .string()
    .min(3, "Yuklash manzili kamida 3 ta belgidan iborat bo'lishi lozim"),
  delivery: z
    .string()
    .min(3, "Topshirish manzili kamida 3 ta belgidan iborat bo'lishi lozim"),
  estDistance: z.coerce
    .number()
    .positive("Masofa kamida 1 km bo'lishi lozim")
    .max(10000, "Masofa me'yordan ortiq"),
  pickupRegion: z.string().optional(),
  deliveryRegion: z.string().optional(),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
});

/**
 * Step 2: Cargo Specifications Validation Schema
 */
export const CargoStepSchema = z.object({
  cargoType: z
    .string()
    .min(2, "Yuk turi kamida 2 ta belgidan iborat bo'lishi kerak"),
  weight: z.coerce
    .number()
    .positive("Yuk og'irligi 0 dan yuqori bo'lishi kerak")
    .max(100000, "Yuk og'irligi 100 tonnadan oshmasligi kerak"),
  volume: z.coerce
    .number()
    .positive("Yuk hajmi 0 dan yuqori bo'lishi kerak")
    .max(300, "Maksimal hajm 300 m³ dan oshmasligi kerak"),
  docs: z.string().optional(),
});

/**
 * Step 3: Vehicle Fleet Selection Validation Schema
 */
export const VehicleStepSchema = z.object({
  vehicle: z
    .string()
    .min(2, "Transport vositasini tanlang"),
  price: z.coerce
    .number()
    .min(500000, "Buyurtma qiymati minimal 500,000 UZS bo'lishi lozim"),
});

/**
 * Step 4: Dispatcher & Receiver Contacts Validation Schema
 */
export const ContactsStepSchema = z.object({
  phone: z
    .string()
    .min(7, "Telefon raqami juda qisqa")
    .regex(phoneRegex, "Yaroqsiz telefon formati (Masalan: +998 90 123 45 67)"),
  receiver: z
    .string()
    .min(7, "Qabul qiluvchi telefon raqami juda qisqa")
    .regex(phoneRegex, "Yaroqsiz telefon formati (Masalan: +998 94 987 65 43)"),
  comment: z.string().max(1000, "Izoh 1000 belgidan oshmasligi kerak").optional(),
  image: z.string().optional(),
});

/**
 * Step 5: Escrow Payment Method Validation Schema
 */
export const PaymentStepSchema = z.object({
  payment: z.enum(["cash", "transfer", "click", "payme", "xazna"]),
});

/**
 * Full Order Submission Schema (Combining all 5 steps)
 */
export const FullOrderBookingSchema = RouteStepSchema
  .merge(CargoStepSchema)
  .merge(VehicleStepSchema)
  .merge(ContactsStepSchema)
  .merge(PaymentStepSchema);

export type RouteStepData = z.infer<typeof RouteStepSchema>;
export type CargoStepData = z.infer<typeof CargoStepSchema>;
export type VehicleStepData = z.infer<typeof VehicleStepSchema>;
export type ContactsStepData = z.infer<typeof ContactsStepSchema>;
export type PaymentStepData = z.infer<typeof PaymentStepSchema>;
export type FullOrderBookingData = z.infer<typeof FullOrderBookingSchema>;
