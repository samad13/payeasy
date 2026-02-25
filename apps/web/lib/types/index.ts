/**
 * @file index.ts
 * @description Barrel export for all shared types.
 *
 * Import from this file for convenient access:
 * ```ts
 * import type { User, Listing, ApiResponse } from '@/lib/types'
 * import { listingInsertSchema } from '@/lib/types'
 * ```
 */

// Database model types & the Supabase Database interface
export type {
  // Branded primitives
  StellarPublicKey,
  ContractId,
  ISOTimestamp,

  // Status enums
  ListingStatus,
  PaymentStatus,
  AgreementStatus,
  MessageType,

  // User
  UserRow,
  User,
  UserInsert,
  UserUpdate,
  PublicUser,

  // Listing
  ListingRow,
  Listing,
  ListingInsert,
  ListingUpdate,
  ListingWithLandlord,
  ListingWithAmenities,
  ListingDetail,

  // ListingAmenity
  ListingAmenityRow,
  ListingAmenity,
  ListingAmenityInsert,

  // Message (legacy - deprecated in favor of ConversationMessage)
  MessageRow,
  Message,
  MessageInsert,
  MessageUpdate,
  MessageWithSender,

  // Conversation
  ConversationRow,
  Conversation,
  ConversationInsert,
  ConversationUpdate,
  ConversationWithUsers,

  // ConversationMessage
  ConversationMessageRow,
  ConversationMessage,
  ConversationMessageInsert,
  ConversationMessageUpdate,
  ConversationMessageWithSender,

  // PaymentRecord
  PaymentRecordRow,
  PaymentRecord,
  PaymentRecordInsert,
  PaymentRecordUpdate,
  PaymentRecordWithTenant,

  // RentAgreement
  RentAgreementRow,
  RentAgreement,
  RentAgreementInsert,
  RentAgreementUpdate,
  RentAgreementDetail,

  // UserFavorite
  UserFavoriteRow,
  UserFavorite,
  UserFavoriteInsert,
  UserFavoriteWithListing,

  // Notification
  NotificationType,
  NotificationRow,
  Notification,
  NotificationInsert,
  NotificationUpdate,
  NotificationPreferencesRow,
  NotificationPreferences,
  NotificationPreferencesUpdate,

  // Supabase typed client interface
  Database,
} from './database'

// API request/response types
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,

  // Listings
  ListingSearchParams,
  ListingSearchResult,
  ListingCardResponse,
  ListingDetailResponse,
  CreateListingBody,
  UpdateListingBody,

  // Messages
  MessageThreadResponse,
  SendMessageBody,

  // Payments
  PaymentSummary,
  ListingPaymentsResponse,

  // Auth / User
  AuthUserResponse,
  UserProfileResponse,
  PublicUserProfileResponse,
  RegisterUserBody,
  UpdateUserBody,

  // Conversations
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationBody,
  SendConversationMessageBody,
  ConversationPreview,

  // Favorites
  UserFavoritesResponse,
  FavoriteToggleResponse,
  FavoriteStatus,
} from './api'

// Zod validation schemas (values — can be used at runtime)
export {
  stellarPublicKeySchema,
  isoTimestampSchema,
  uuidSchema,
  paymentPeriodSchema,
  isoDateSchema,
  radiusSchema,
  userInsertSchema,
  userUpdateSchema,
  listingInsertSchema,
  listingUpdateSchema,
  listingAmenityInsertSchema,
  messageInsertSchema,
  messageUpdateSchema,
  paymentRecordInsertSchema,
  paymentRecordUpdateSchema,
  rentAgreementInsertSchema,
  rentAgreementUpdateSchema,
  conversationInsertSchema,
  conversationUpdateSchema,
  messageTypeSchema,
  conversationMessageInsertSchema,
  conversationMessageUpdateSchema,
  userFavoriteInsertSchema,
  listingSearchParamsSchema,
} from './validation'

// z.infer-derived input types (compile-time only)
export type {
  UserInsertInput,
  UserUpdateInput,
  ListingInsertInput,
  ListingUpdateInput,
  ListingAmenityInsertInput,
  ConversationInsertInput,
  ConversationUpdateInput,
  ConversationMessageInsertInput,
  ConversationMessageUpdateInput,
  UserFavoriteInsertInput,
  MessageInsertInput,
  MessageUpdateInput,
  PaymentRecordInsertInput,
  PaymentRecordUpdateInput,
  RentAgreementInsertInput,
  RentAgreementUpdateInput,
  ListingSearchParamsInput,
} from './validation'
