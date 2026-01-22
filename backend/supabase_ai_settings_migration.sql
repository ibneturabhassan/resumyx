-- Create AI settings table for storing user AI provider preferences
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    provider_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);

-- Enable Row Level Security
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AI settings
CREATE POLICY "Users can view their own AI settings"
    ON ai_settings
    FOR SELECT
    USING (user_id::uuid = auth.uid());

-- Policy: Users can insert their own AI settings
CREATE POLICY "Users can insert their own AI settings"
    ON ai_settings
    FOR INSERT
    WITH CHECK (user_id::uuid = auth.uid());

-- Policy: Users can update their own AI settings
CREATE POLICY "Users can update their own AI settings"
    ON ai_settings
    FOR UPDATE
    USING (user_id::uuid = auth.uid());

-- Policy: Users can delete their own AI settings
CREATE POLICY "Users can delete their own AI settings"
    ON ai_settings
    FOR DELETE
    USING (user_id::uuid = auth.uid());

-- Add comment
COMMENT ON TABLE ai_settings IS 'Stores user preferences for AI providers (Gemini, OpenAI, OpenRouter)';
