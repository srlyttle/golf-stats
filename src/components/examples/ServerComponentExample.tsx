import { createServerSupabaseClient } from "@/lib/supabase/server";

// This is a server component that can fetch data server-side
export default async function ServerComponentExample() {
  const supabase = await createServerSupabaseClient();

  // Example: Fetch courses for the authenticated user
  const { data: courses, error } = await supabase
    .from("golf_courses")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Error fetching courses:", error);
    return <div>Error loading courses</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">
        Recent Courses (Server Rendered)
      </h3>
      {courses && courses.length > 0 ? (
        <ul className="space-y-1">
          {courses.map((course) => (
            <li key={course.id} className="text-sm text-gray-600">
              {course.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No courses found</p>
      )}
    </div>
  );
}
