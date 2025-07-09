/*
  # Gymnastics Competition Database Schema

  1. New Tables
    - `competitions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `date` (date)
      - `section` (text) - 'men' or 'women'
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
    
    - `competitors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `team` (text)
      - `level` (text)
      - `competition_id` (uuid, foreign key)
      - `section` (text) - 'men' or 'women'
      - `created_at` (timestamp)
    
    - `scores`
      - `id` (uuid, primary key)
      - `competitor_id` (uuid, foreign key)
      - `event_id` (text)
      - `score` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  section text NOT NULL CHECK (section IN ('men', 'women')),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team text NOT NULL,
  level text NOT NULL,
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('men', 'women')),
  created_at timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  score decimal(5,2) NOT NULL CHECK (score >= 0 AND score <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(competitor_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for competitions
CREATE POLICY "Users can view their own competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitions"
  ON competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitions"
  ON competitions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitions"
  ON competitions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for competitors
CREATE POLICY "Users can view competitors in their competitions"
  ON competitors
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitors in their competitions"
  ON competitors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    competition_id IN (
      SELECT id FROM competitions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors in their competitions"
  ON competitors
  FOR UPDATE
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors in their competitions"
  ON competitors
  FOR DELETE
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE user_id = auth.uid()
    )
  );

-- Create policies for scores
CREATE POLICY "Users can view scores for their competitors"
  ON scores
  FOR SELECT
  TO authenticated
  USING (
    competitor_id IN (
      SELECT c.id FROM competitors c
      JOIN competitions comp ON c.competition_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scores for their competitors"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    competitor_id IN (
      SELECT c.id FROM competitors c
      JOIN competitions comp ON c.competition_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scores for their competitors"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (
    competitor_id IN (
      SELECT c.id FROM competitors c
      JOIN competitions comp ON c.competition_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scores for their competitors"
  ON scores
  FOR DELETE
  TO authenticated
  USING (
    competitor_id IN (
      SELECT c.id FROM competitors c
      JOIN competitions comp ON c.competition_id = comp.id
      WHERE comp.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_competition_id ON competitors(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_competitor_id ON scores(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scores_competitor_event ON scores(competitor_id, event_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for scores table
CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();