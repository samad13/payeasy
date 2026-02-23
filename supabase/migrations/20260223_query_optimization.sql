-- Query optimization: indexes and views for faster reads

-- Conversations + messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
  ON public.messages (conversation_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_deleted_at
  ON public.messages (conversation_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
  ON public.conversation_participants (user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON public.conversations (updated_at DESC);

-- Favorites + recent views
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_created_at
  ON public.user_favorites (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_view_history_user_viewed_at
  ON public.user_view_history (user_id, viewed_at DESC);

-- Listings + amenities
CREATE INDEX IF NOT EXISTS idx_listings_landlord_status
  ON public.listings (landlord_id, status);

CREATE INDEX IF NOT EXISTS idx_listing_amenities_listing_id
  ON public.listing_amenities (listing_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_contract_transactions_user_created_at
  ON public.contract_transactions (user_id, created_at DESC);

-- View for fast last-message lookups
CREATE OR REPLACE VIEW public.conversation_last_messages AS
SELECT DISTINCT ON (conversation_id)
  conversation_id,
  id AS message_id,
  sender_id,
  content,
  created_at
FROM public.messages
WHERE deleted_at IS NULL
ORDER BY conversation_id, created_at DESC;
