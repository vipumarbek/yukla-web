/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VehicleType {
  LABO = "Labo",
  BONGO = "Bongo",
  FURGON = "Furgon",
  ISUZU_5 = "ISUZU 5",
  ISUZU_10 = "ISUZU 10",
  GRUZOVIK = "Gruzovik",
  FURA_TENT = "Fura Tent",
  FURA_BUDKA = "Fura Budka",
  REFREJIRATOR = "Refrejirator",
  PARAVOZ = "Paravoz",
  SHALANDA = "Shalanda",
}

export enum OrderStatus {
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  LOADING = "Loading",
  IN_TRANSIT = "In Transit",
  DELIVERED = "Delivered",
  CONFIRMATION = "Customer Confirmation",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export type EscrowPayoutState = "PENDING_MATCH" | "IN_TRANSIT" | "DELIVERED_UNCONFIRMED" | "PAYOUT_CLEARED" | "REFUNDED";

export type Role = "customer" | "driver" | "company" | "admin" | "superadmin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  companyName?: string;
  companyTaxId?: string;
  ownerName?: string;
  address?: string;
  licenseNumber?: string;
  logo?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  vehicleType?: string; // For drivers
  vehiclePlates?: string; // For drivers
  profilePhoto?: string;
  emailVerified?: boolean;
  verified?: boolean;
  walletBalance?: number;
  referralCode?: string;
  referredBy?: string;
  subscriptionPlan?: "starter" | "growth" | "enterprise";
  language?: string;
  biometricEnabled?: boolean;
  notificationSettings?: {
    soundEnabled: boolean;
    pushEnabled: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyEntity {
  id: string;
  companyId: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string; // STIR / INN
  licenseNumber: string;
  logo?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  plan: "starter" | "growth" | "enterprise";
  walletBalance: number;
  totalFleetCount: number;
  activeDriversCount: number;
  totalCompletedOrders: number;
  rating: number;
  bankDetails?: {
    bankName: string;
    mfo: string;
    accountNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDriver {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  assignedTruckId?: string;
  assignedTruckPlate?: string;
  status: "active" | "on_trip" | "idle" | "suspended" | "pending_approval";
  rating: number;
  completedTrips: number;
  currentLocation: string;
  lat: number;
  lng: number;
  monthlySalaryOrShare: number;
  avatarUrl?: string;
  joinedDate: string;
  createdAt: string;
}

export interface CompanyTruck {
  id: string;
  companyId: string;
  brand: string;
  model: string;
  plateNumber: string;
  vehicleType: string;
  capacityTons: number;
  volumeM3: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: "available" | "in_transit" | "maintenance" | "idle";
  insuranceStatus: "valid" | "expiring_soon" | "expired";
  insuranceExpiryDate: string;
  maintenanceStatus: "good" | "needs_service" | "in_shop";
  lastServiceDate: string;
  fuelLevel: number; // percentage 0-100
  mileageKm: number;
  currentLat: number;
  currentLng: number;
  currentLocationName: string;
  techPassport: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CompanyInvoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  orderId?: string;
  clientName: string;
  clientTaxNumber?: string;
  amount: number;
  taxAmount: number; // QQS 12%
  totalAmount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  issuedDate: string;
  notes?: string;
}

export interface CompanyExpense {
  id: string;
  companyId: string;
  category: "fuel" | "maintenance" | "driver_salary" | "tolls_customs" | "insurance" | "platform_fee" | "other";
  amount: number;
  description: string;
  truckId?: string;
  truckPlate?: string;
  driverId?: string;
  driverName?: string;
  date: string;
  receiptNumber?: string;
}

export interface CompanyApiKey {
  id: string;
  companyId: string;
  name: string;
  key: string;
  environment: "production" | "sandbox";
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface CompanyWebhook {
  id: string;
  companyId: string;
  url: string;
  events: string[];
  status: "active" | "paused";
  secret: string;
  createdAt: string;
}

export interface CompanyFinanceSummary {
  grossRevenue: number;
  platformCommission: number;
  netRevenue: number;
  totalExpenses: number;
  fuelCosts: number;
  driverPayouts: number;
  maintenanceCosts: number;
  tollsAndCustoms: number;
  netOperatingProfit: number;
  profitMarginPercent: number;
}

export interface CompanyFleetMember {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlates: string;
  status: "idle" | "in_transit" | "maintenance" | "offline";
  currentLocation?: string;
  rating: number;
  totalTrips: number;
  earnings: number;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  maxDiscountSom: number;
  validUntil: string;
  description: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  pickupAddress: string;
  pickupCountry: string;
  pickupRegion: string;
  pickupDistrict: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryCountry: string;
  deliveryRegion: string;
  deliveryDistrict: string;
  deliveryLat: number;
  deliveryLng: number;
  cargoType: string;
  weight: number; // in kg
  volume: number; // in m3
  vehicleType: string;
  phoneNumber: string;
  receiverNumber: string;
  price: number; // in Uzbekistan so'm
  paymentMethod: "cash" | "card" | "transfer" | "click" | "payme" | "xazna";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  comment?: string;
  cargoImage?: string; // base64 or placeholder
  documents?: string; // base64 or placeholder
  status: OrderStatus;
  escrowStatus?: EscrowPayoutState;
  isArchived?: boolean;
  archivedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // transactionId
  orderId: string;
  customerId: string;
  customerName: string;
  paymentMethod: "click" | "payme" | "xazna" | "cash" | "transfer";
  amount: number;
  status: "Pending" | "Paid" | "Failed" | "Refunded";
  createdAt: string;
  updatedAt: string;
  log?: string[];
}

export interface Payout {
  id: string;
  orderId: string;
  driverId: string;
  driverName: string;
  amount: number;
  commission: number; // 3%
  driverNet: number; // 97%
  status: "Pending" | "Paid" | "Failed";
  createdAt: string;
}

export interface RevenueRecord {
  id: string;
  orderId: string;
  totalPrice: number;
  revenue: number; // Platform commission (3%)
  commissionRate: number; // 0.03
  driverEarnings: number; // 97%
  driverId: string;
  driverName: string;
  customerId: string;
  customerName: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  questionUz: string;
  questionEn: string;
  questionRu: string;
  questionTr: string;
  questionAr: string;
  questionZh: string;
  questionFr: string;
  questionDe: string;
  questionEs: string;
  questionPt: string;
  questionIt: string;
  answerUz: string;
  answerEn: string;
  answerRu: string;
  answerTr: string;
  answerAr: string;
  answerZh: string;
  answerFr: string;
  answerDe: string;
  answerEs: string;
  answerPt: string;
  answerIt: string;
}

export interface NewsArticle {
  id: string;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  titleTr: string;
  titleAr: string;
  titleZh: string;
  titleFr: string;
  titleDe: string;
  titleEs: string;
  titlePt: string;
  titleIt: string;
  contentUz: string;
  contentEn: string;
  contentRu: string;
  contentTr: string;
  contentAr: string;
  contentZh: string;
  contentFr: string;
  contentDe: string;
  contentEs: string;
  contentPt: string;
  contentIt: string;
  date: string;
  image?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  timestamp: string;
  details: string;
}

export type LanguageCode =
  | "uz"
  | "en"
  | "ru"
  | "tr"
  | "ar"
  | "zh"
  | "fr"
  | "de"
  | "es"
  | "pt"
  | "it";

export interface Vehicle {
  id: string;
  driverId: string;
  vehicleType: string;
  licensePlate: string;
  licensePlateNumber?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  dimensions: string;
  photo?: string;
  documents?: string;
  vehiclePhoto?: string;
  vehicleDocuments?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenderBid {
  id: string;
  tenderId: string;
  bidderId: string;
  bidderName: string;
  bidderRole: "driver" | "company";
  bidderPhone: string;
  pricePerTrip: number;
  availableTrucks: number;
  slaCommitmentDays: number;
  cargoInsuranceCovered: boolean;
  comment?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface EnterpriseTender {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  origin: string;
  destination: string;
  cargoType: string;
  requiredVehicleType: string;
  estimatedMonthlyTrips: number;
  targetBudgetPerTrip: number;
  contractDurationMonths: number;
  specialRequirements?: string;
  bidsCount: number;
  status: "open" | "evaluating" | "awarded" | "closed";
  deadline: string;
  createdAt: string;
  bids?: TenderBid[];
}

export interface BackhaulMatch {
  id: string;
  outboundOrderId: string;
  outboundRoute: { from: string; to: string; distanceKm: number; price: number };
  returnOrderId: string;
  returnRoute: { from: string; to: string; distanceKm: number; price: number };
  deadheadKmSaved: number;
  totalDistanceKm: number;
  combinedRevenueSom: number;
  driverFuelSavingsSom: number;
  shipperDiscountPercent: number;
  efficiencyRating: number; // 0 - 100%
  status: "available" | "locked" | "dispatched";
}

export interface FuelAdvanceRequest {
  id: string;
  driverId: string;
  driverName: string;
  orderId: string;
  orderAmount: number;
  advanceAmount: number; // typically 50%
  serviceFee: number; // 2.5%
  netDisbursed: number;
  cardNumber: string; // masked (e.g. 9860 **** **** 1234)
  status: "approved" | "disbursed" | "settled" | "rejected";
  disbursedAt?: string;
  createdAt: string;
}

export interface SilkRoadCorridor {
  id: string;
  name: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  distanceKm: number;
  avgTransitDays: number;
  avgBorderWaitHours: number;
  spotRatePerKmSom: number;
  customsDutyEstimateUsd: number;
  greenCorridorCertified: boolean;
  activeTrucksCount: number;
  popularCargos: string[];
}

export interface SpotRateIndexRecord {
  corridorId: string;
  corridorName: string;
  currentRateSom: number;
  rateChange24hPercent: number;
  dieselPriceLiterSom: number;
  supplyDemandRatio: "surplus" | "balanced" | "high_demand";
  lastUpdated: string;
}

export type IntegrationStatus = "implemented" | "mock_demo" | "planned";

export interface IntegrationRegistryItem {
  id: string;
  name: string;
  category: "banking" | "customs" | "insurance" | "telematics_iot" | "fuel_network" | "edi_tax";
  provider: string;
  status: IntegrationStatus;
  protocol: string;
  description: string;
  lastHealthCheck?: string;
  supportedFeatures: string[];
}

export interface FactoringInvoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  clientName: string;
  clientTaxId: string;
  orderId?: string;
  orderRoute?: string;
  grossAmount: number;
  vatAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  paymentTermDays: number;
  factoringStatus: "unfactored" | "requested" | "approved" | "funded" | "settled" | "rejected";
  factoringAdvanceRatePercent: number; // e.g. 85%
  factoringFeePercent: number; // e.g. 2.75%
  advanceAmount: number;
  feeAmount: number;
  netPayoutAmount: number;
  fundedAt?: string;
  settledAt?: string;
  documentsAttached?: string[];
  createdAt: string;
}

export interface FactoringRequest {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  clientName: string;
  invoiceAmount: number;
  requestedAdvanceAmount: number;
  serviceFeeAmount: number;
  netDisbursementAmount: number;
  bankAccount: string;
  mfo: string;
  status: "pending_review" | "approved" | "funded" | "settled" | "rejected";
  reviewerNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  fundedAt?: string;
}

export type CustomsDocType = "e_cmr" | "digital_tir" | "customs_declaration" | "phytosanitary_cert";

export interface CustomsDocument {
  id: string;
  docType: CustomsDocType;
  docNumber: string;
  senderName: string;
  senderCountry: string;
  senderAddress: string;
  receiverName: string;
  receiverCountry: string;
  receiverAddress: string;
  carrierName: string;
  carrierLicense: string;
  truckPlate: string;
  trailerPlate?: string;
  originCity: string;
  destinationCity: string;
  transitCheckpoints: string[];
  cargoDescription: string;
  hsCode: string; // Harmonized System tariff code (e.g. 8415.10.900)
  packagesCount: number;
  packageType: string;
  grossWeightKg: number;
  volumeM3: number;
  declaredValueUsd: number;
  sealNumbers: string[];
  status: "draft" | "submitted" | "under_review" | "border_stamped" | "cleared" | "inspection_required";
  digitalSignatureHash: string;
  qrPayload: string;
  issuedAt: string;
  clearedAt?: string;
}

export interface BorderCheckpoint {
  id: string;
  name: string;
  localName: string;
  countryPair: string; // e.g. "UZ - KZ", "UZ - TM", "KZ - CN"
  locationName: string;
  queueTrucksCount: number;
  avgWaitHours: number;
  congestionLevel: "low" | "moderate" | "high" | "severe";
  greenChannelActive: boolean;
  electronicQueueSupported: boolean;
  status: "operational" | "delayed" | "temporarily_restricted";
  lastReportedAt: string;
  integrationMode: IntegrationStatus;
  recentNotice?: string;
}

export interface ColdChainNode {
  id: string;
  truckId: string;
  truckPlate: string;
  driverName: string;
  cargoName: string;
  route: string;
  sensorModel: string;
  setpointMinC: number;
  setpointMaxC: number;
  currentTempC: number;
  currentHumidityPct: number;
  batteryPct: number;
  doorStatus: "closed" | "open";
  gpsLat: number;
  gpsLng: number;
  lastPing: string;
  status: "compliant" | "warning" | "excursion_breach";
  excursionsCount: number;
  integrationMode: IntegrationStatus;
}

export interface ColdChainTelemetryPoint {
  timestamp: string;
  tempC: number;
  humidityPct: number;
  doorOpen: boolean;
  speedKmH: number;
  altitudeM: number;
}

export interface LogisticsHub {
  id: string;
  name: string;
  code: string;
  city: string;
  region: string;
  address: string;
  totalCapacitySqM: number;
  palletPositions: number;
  occupiedPallets: number;
  crossDockDocks: number;
  availableDocks: number;
  coldStorageAvailable: boolean;
  bondedCustomsZone: boolean;
  lat: number;
  lng: number;
  operatingHours: string;
  managerPhone: string;
}

export interface LtlShipment {
  id: string;
  trackingCode: string;
  shipperName: string;
  shipperPhone: string;
  receiverName: string;
  receiverPhone: string;
  originHubId: string;
  originHubName: string;
  destinationHubId: string;
  destinationHubName: string;
  cargoDescription: string;
  palletsCount: number;
  weightKg: number;
  volumeM3: number;
  priceSom: number;
  status: "received_at_hub" | "staged_for_linehaul" | "in_linehaul_transit" | "arrived_destination_hub" | "out_for_delivery" | "delivered";
  assignedManifestId?: string;
  createdAt: string;
}

export interface ConsolidationManifest {
  id: string;
  manifestNumber: string;
  originHubId: string;
  destinationHubId: string;
  routeName: string;
  truckPlate: string;
  driverName: string;
  driverPhone: string;
  maxTons: number;
  maxVolumeM3: number;
  loadedTons: number;
  loadedVolumeM3: number;
  utilizationTonsPct: number;
  utilizationVolumePct: number;
  shipmentsCount: number;
  shipmentIds: string[];
  departureScheduledAt: string;
  estimatedArrivalAt: string;
  status: "building" | "sealed" | "dispatched" | "completed";
  createdAt: string;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  stopType: "pickup" | "delivery" | "cross_dock" | "customs_checkpoint";
  packageWeightKg?: number;
  timeWindow?: string;
}

export interface OptimizedRouteLeg {
  fromName: string;
  toName: string;
  distanceKm: number;
  durationMinutes: number;
  tollRequired: boolean;
  mountainPass: boolean;
}

export interface RouteOptimizationResult {
  origin: string;
  destination: string;
  orderedWaypoints: RouteWaypoint[];
  legs: OptimizedRouteLeg[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedDieselLiters: number;
  estimatedFuelCostSom: number;
  estimatedTollCostSom: number;
  co2EmissionsKg: number;
  passRestrictions: string[];
  optimizationAlgorithm: string;
}

export interface YuklaWallet {
  userId: string;
  userEmail: string;
  currency: string;
  availableBalance: number;
  escrowBalance: number;
  pendingWithdrawals: number;
  totalFactoredFunded: number;
  lastUpdated: string;
}

export interface WalletLedgerEntry {
  id: string;
  userId: string;
  entryType: "deposit" | "withdrawal" | "escrow_hold" | "escrow_release" | "factoring_advance" | "factoring_fee" | "order_payment" | "order_earning";
  amount: number;
  balanceAfter: number;
  orderId?: string;
  invoiceId?: string;
  referenceCode: string;
  description: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
}

export interface EnterpriseIntegration {
  id: string;
  name: string;
  provider: string;
  category: "banking" | "customs" | "insurance" | "telematics_iot" | "fuel" | "tax_didox" | "government";
  status: "implemented" | "mock_demo" | "planned";
  protocol: string;
  latencyMs: number;
  endpoint: string;
  description: string;
  lastChecked: string;
  sandboxAvailable: boolean;
  docUrl?: string;
}

// -------------------------------------------------------------
// OPERATIONS CENTER TYPES
// -------------------------------------------------------------
export interface OperationalAlert {
  id: string;
  type: "weather" | "road_closure" | "border_delay" | "sla_breach" | "vehicle_breakdown" | "security_incident";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  corridorOrLocation: string;
  affectedOrdersCount: number;
  status: "active" | "investigating" | "resolved";
  reportedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface OperationsSummary {
  liveOrdersCount: number;
  activeDriversCount: number;
  fleetUtilizationPct: number;
  delayedOrdersCount: number;
  slaBreachRiskCount: number;
  activeAlertsCount: number;
  averageTripSpeedKmh: number;
  onTimeDeliveryRatePct: number;
}

// -------------------------------------------------------------
// SUPPORT CRM TYPES
// -------------------------------------------------------------
export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface TicketInternalNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userRole: Role;
  userPhone: string;
  orderId?: string;
  subject: string;
  category: "billing_payment" | "cargo_damage" | "delay_complaint" | "account_verification" | "app_issue" | "general";
  priority: "urgent" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  assignedAgentName?: string;
  slaExpiresAt: string;
  slaBreached: boolean;
  messages: TicketMessage[];
  internalNotes: TicketInternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  category: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  viewsCount: number;
  helpfulCount: number;
  updatedAt: string;
}

// -------------------------------------------------------------
// NOTIFICATION CENTER TYPES
// -------------------------------------------------------------
export interface NotificationItem {
  id: string;
  channel: "sms" | "push" | "email" | "telegram" | "whatsapp";
  recipient: string;
  recipientName?: string;
  title: string;
  body: string;
  status: "sent" | "delivered" | "failed" | "queued";
  sentAt: string;
  deliveredAt?: string;
  retryCount: number;
  errorReason?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  code: string;
  channels: ("sms" | "push" | "email" | "telegram")[];
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  lastEdited: string;
}

// -------------------------------------------------------------
// ENTERPRISE SECURITY TYPES
// -------------------------------------------------------------
export interface UserDevice {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
  status: "trusted" | "suspicious" | "revoked";
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  authMethod: "password" | "2fa_totp" | "refresh_token" | "api_key";
  status: "success" | "failed" | "blocked";
  riskScore: number; // 0-100
  timestamp: string;
}

export interface ApiKeyEntry {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  status: "active" | "revoked";
}

// -------------------------------------------------------------
// OBSERVABILITY & TELEMETRY TYPES
// -------------------------------------------------------------
export interface SystemObservabilityStats {
  uptimeSeconds: number;
  cpuUsagePct: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  heapUsedMb: number;
  eventLoopLagMs: number;
  totalRequestsCount: number;
  requestsPerSecond: number;
  errorRatePct: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeSocketsCount: number;
  activeQueueJobsCount: number;
  sentryStatus: "connected" | "standby";
}

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: "http" | "auth" | "order" | "escrow" | "ai" | "telematics" | "security";
  message: string;
  details?: any;
}

export interface BackgroundJobItem {
  id: string;
  name: string;
  queue: "orders" | "notifications" | "factoring" | "telematics" | "settlement";
  status: "running" | "completed" | "delayed" | "failed" | "queued";
  progressPct: number;
  data: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  processedAt?: string;
}

// -------------------------------------------------------------
// DISASTER RECOVERY & BACKUP TYPES
// -------------------------------------------------------------
export interface BackupSnapshot {
  id: string;
  filename: string;
  sizeBytes: number;
  checksumSha256: string;
  recordsCount: {
    users: number;
    orders: number;
    wallets: number;
    transactions: number;
  };
  backupType: "scheduled_daily" | "manual_point_in_time" | "pre_migration";
  status: "verified" | "corrupt" | "in_progress";
  createdAt: string;
}

// -------------------------------------------------------------
// SCALABILITY & CACHING TYPES
// -------------------------------------------------------------
export interface ScalabilityMetrics {
  redisStatus: "connected_cluster" | "in_memory_optimized";
  cacheHitRatioPct: number;
  cachedKeysCount: number;
  connectionPoolActive: number;
  connectionPoolMax: number;
  queueWorkersCount: number;
  queueThroughputPerSec: number;
  cdnHitRatioPct: number;
  objectStorageUsedMb: number;
}

// -------------------------------------------------------------
// DYNAMIC RULES & SYSTEM SETTINGS
// -------------------------------------------------------------
export interface EnterpriseSystemSettings {
  maintenanceMode: boolean;
  maintenanceReason?: string;
  minMobileAppVersion: string;
  forceAppUpdate: boolean;
  allowGuestCalculations: boolean;
  defaultCurrency: string;
  globalPlatformFeePct: number;
  factoringAdvanceRatePct: number;
  factoringDiscountRatePct: number;
  instantPayoutFeePct: number;
  taxVatRatePct: number;
  autoEscrowReleaseHours: number;
}

export interface DynamicPricingRule {
  id: string;
  vehicleType: string;
  baseFareSom: number;
  pricePerKmSom: number;
  pricePerTonKmSom: number;
  mountainPassMultiplier: number;
  nightSurgeMultiplier: number;
  crossBorderMultiplier: number;
  isActive: boolean;
}

export interface CommissionRule {
  id: string;
  tierName: string;
  minMonthlyVolumeSom: number;
  commissionRatePct: number;
  factoringDiscountPct: number;
  dedicatedManager: boolean;
}

// -------------------------------------------------------------
// AUTOMATED QA & PRODUCTION DIAGNOSTIC TYPES
// -------------------------------------------------------------
export interface QATestItem {
  id: string;
  category: "auth" | "orders" | "payments" | "wallet" | "ai" | "api" | "rbac" | "security";
  testName: string;
  status: "passed" | "warning" | "failed";
  durationMs: number;
  details: string;
}

export interface ProductionReadinessReport {
  executionId: string;
  timestamp: string;
  totalTests: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  healthScorePct: number;
  completedFeatures: string[];
  missingFeatures: string[];
  knownBugs: string[];
  performanceMetrics: {
    averageApiLatencyMs: number;
    p99LatencyMs: number;
    dbQueryLatencyMs: number;
    cacheHitRatioPct: number;
  };
  securityAudit: {
    xssProtection: boolean;
    rateLimitingActive: boolean;
    bcryptRounds: number;
    rbacEnforcement: boolean;
    auditLogging: boolean;
  };
  tests: QATestItem[];
}

export type QAReport = ProductionReadinessReport;

// -------------------------------------------------------------
// TYPE ALIASES & COMPATIBILITY EXPORTS
// -------------------------------------------------------------
export type SystemSettings = EnterpriseSystemSettings;
export type PricingRule = DynamicPricingRule;
export type ObservabilityStats = SystemObservabilityStats;
export type BackgroundJob = BackgroundJobItem;
export type ScalabilityStatus = ScalabilityMetrics;
export type LoginHistoryRecord = LoginHistoryEntry;
export type ApiKeyMetadata = ApiKeyEntry;

export interface NotificationChannelStatus {
  smsActive: boolean;
  telegramActive: boolean;
  emailActive: boolean;
  pushActive: boolean;
  webhookActive: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  recipient: string;
  recipientRole: "user" | "driver" | "company" | "admin";
  channel: "sms" | "telegram" | "email" | "push" | "webhook";
  title: string;
  body: string;
  status: "sent" | "delivered" | "failed" | "queued";
  sentAt: string;
}

