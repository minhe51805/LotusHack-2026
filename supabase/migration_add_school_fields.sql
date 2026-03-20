-- ============================================================================
-- Migration: extend schools table to match schools_structured.json schema
-- Run this in the Supabase SQL editor after schema.sql
-- ============================================================================

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS levels TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tuition JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fields TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gpa_required JSONB,
  ADD COLUMN IF NOT EXISTS certs_required JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS website TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS detail_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS excerpt TEXT NOT NULL DEFAULT '';
