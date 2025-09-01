-- Golf Stats Database Schema
-- Run this in your Supabase SQL Editor

-- Create golf_courses table
CREATE TABLE IF NOT EXISTS golf_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Create holes table
CREATE TABLE IF NOT EXISTS holes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, hole_number)
);

-- Create green_readings table
CREATE TABLE IF NOT EXISTS green_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hole_id UUID NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
  pin_position TEXT NOT NULL,
  distance_on INTEGER NOT NULL,
  distance_from_side INTEGER NOT NULL,
  side_from TEXT NOT NULL CHECK (side_from IN ('left', 'right', 'middle')),
  approach_direction TEXT NOT NULL CHECK (approach_direction IN ('front', 'back', 'left', 'right')),
  break_description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own courses" ON golf_courses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view holes for their courses" ON holes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM golf_courses 
      WHERE id = holes.course_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own green readings" ON green_readings
  FOR ALL USING (auth.uid() = user_id);
