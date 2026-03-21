ALTER TABLE settings
ADD COLUMN IF NOT EXISTS zalo_system_prompt TEXT NOT NULL DEFAULT '';

UPDATE settings
SET zalo_system_prompt = system_prompt
WHERE COALESCE(TRIM(zalo_system_prompt), '') = '';
