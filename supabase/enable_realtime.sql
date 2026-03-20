-- ============================================================================
-- Enable Supabase Realtime on sessions table
-- Run this in the Supabase SQL editor.
-- REPLICA IDENTITY FULL lets Realtime include the old row on UPDATE events
-- so the admin can detect when a lead was just added.
-- ============================================================================

ALTER TABLE sessions REPLICA IDENTITY FULL;

-- Add sessions to the Supabase realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
