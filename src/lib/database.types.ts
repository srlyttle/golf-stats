export interface GolfCourse {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface Hole {
  id: string;
  course_id: string;
  hole_number: number;
  created_at: string;
}

export interface GreenReading {
  id: string;
  hole_id: string;
  pin_position: string;
  distance_on: number;
  distance_from_side: number;
  side_from: "left" | "right" | "middle";
  approach_direction: "front" | "back" | "left" | "right";
  break_description: string;
  notes: string;
  created_at: string;
  user_id: string;
}

export interface Database {
  public: {
    Tables: {
      golf_courses: {
        Row: GolfCourse;
        Insert: Omit<GolfCourse, "id" | "created_at">;
        Update: Partial<Omit<GolfCourse, "id" | "created_at">>;
      };
      holes: {
        Row: Hole;
        Insert: Omit<Hole, "id" | "created_at">;
        Update: Partial<Omit<Hole, "id" | "created_at">>;
      };
      green_readings: {
        Row: GreenReading;
        Insert: Omit<GreenReading, "id" | "created_at">;
        Update: Partial<Omit<GreenReading, "id" | "created_at">>;
      };
    };
  };
}
