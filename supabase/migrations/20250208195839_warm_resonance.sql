/*
  # Add subscription processor table with cascade delete

  1. New Tables
    - `subscription_processors`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key to subscriptions)
      - `processor_id` (text, unique identifier for the processor)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add foreign key constraint with CASCADE DELETE
    - Enable RLS
    - Add policies for authenticated users

  3. Security
    - Enable RLS on subscription_processors table
    - Add policy for authenticated users to manage their own processors
*/

-- Create subscription processors table
CREATE TABLE IF NOT EXISTS subscription_processors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    processor_id text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(processor_id)
);

-- Enable RLS
ALTER TABLE subscription_processors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own subscription processors"
    ON subscription_processors
    FOR ALL
    TO authenticated
    USING (
        subscription_id IN (
            SELECT id FROM subscriptions 
            WHERE auth.uid() = created_by
        )
    );

-- Create index for faster lookups
CREATE INDEX idx_subscription_processors_subscription_id 
    ON subscription_processors(subscription_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_processors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_processors_updated_at
    BEFORE UPDATE ON subscription_processors
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_processors_updated_at();