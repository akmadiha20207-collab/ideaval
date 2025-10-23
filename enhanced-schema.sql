-- Updated Database Schema with Enhanced Idea Fields

-- Drop existing ideas table if it exists
DROP TABLE IF EXISTS ideas CASCADE;

-- Create enhanced ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  industry TEXT NOT NULL,
  brief TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create industry lookup table
CREATE TABLE IF NOT EXISTS industries (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common industries
INSERT INTO industries (name, description) VALUES
('Technology', 'Software, hardware, and digital solutions'),
('Healthcare', 'Medical devices, pharmaceuticals, and health services'),
('Education', 'Educational technology and learning solutions'),
('Finance', 'Fintech, banking, and financial services'),
('E-commerce', 'Online retail and marketplace platforms'),
('Food & Beverage', 'Food technology and restaurant solutions'),
('Transportation', 'Mobility and logistics solutions'),
('Energy', 'Renewable energy and sustainability'),
('Entertainment', 'Media, gaming, and entertainment platforms'),
('Real Estate', 'Property technology and real estate services'),
('Manufacturing', 'Industrial and manufacturing solutions'),
('Agriculture', 'Agtech and farming solutions'),
('Retail', 'Retail technology and consumer solutions'),
('Travel & Tourism', 'Travel technology and hospitality'),
('Sports & Fitness', 'Sports technology and fitness solutions'),
('Beauty & Fashion', 'Beauty tech and fashion solutions'),
('Automotive', 'Automotive technology and mobility'),
('Construction', 'Construction technology and building solutions'),
('Legal', 'Legal technology and law services'),
('Marketing & Advertising', 'Marketing technology and advertising solutions')
ON CONFLICT (name) DO NOTHING;

-- Create updated validations table with enhanced fields
DROP TABLE IF EXISTS validations CASCADE;

CREATE TABLE IF NOT EXISTS validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  validator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mcqs JSONB NOT NULL,
  mcq_answers INTEGER[] DEFAULT '{}',
  vote TEXT CHECK (vote IN ('upvote', 'downvote', 'maybe')) NOT NULL,
  opinion_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, validator_id)
);

-- Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;

-- Create policies for ideas table
CREATE POLICY "Anyone can view ideas" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for industries table
CREATE POLICY "Anyone can view industries" ON industries
  FOR SELECT USING (true);

-- Create policies for validations table
CREATE POLICY "Anyone can view validations" ON validations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own validations" ON validations
  FOR INSERT WITH CHECK (auth.uid() = validator_id);

CREATE POLICY "Users can update their own validations" ON validations
  FOR UPDATE USING (auth.uid() = validator_id);

CREATE POLICY "Users can delete their own validations" ON validations
  FOR DELETE USING (auth.uid() = validator_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_industry ON ideas(industry);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_validations_idea_id ON validations(idea_id);
CREATE INDEX IF NOT EXISTS idx_validations_validator_id ON validations(validator_id);
CREATE INDEX IF NOT EXISTS idx_validations_vote ON validations(vote);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validations_updated_at BEFORE UPDATE ON validations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, user_type)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'non_campus_lead');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to sync existing users
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (id, email, name, user_type, created_at)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    'non_campus_lead',
    au.created_at
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;
  
  RAISE NOTICE 'Synced existing users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function
SELECT sync_existing_users();
