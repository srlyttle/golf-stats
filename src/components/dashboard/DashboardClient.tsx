"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { GolfCourse, Hole } from "@/lib/database.types";
import QuickGreenReadingForm from "@/components/golf/QuickGreenReadingForm";
import UltraQuickForm from "@/components/golf/UltraQuickForm";
import GreenReadingList from "@/components/golf/GreenReadingList";

export default function DashboardClient() {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [selectedHole, setSelectedHole] = useState<string>("");
  const [currentHoleIndex, setCurrentHoleIndex] = useState<number>(0);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddHole, setShowAddHole] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<"quick" | "ultra">("ultra");
  const [courseSectionCollapsed, setCourseSectionCollapsed] = useState(false);
  const [holeSectionCollapsed, setHoleSectionCollapsed] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
      console.log("Auto-selecting first course:", courses[0].name);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    if (selectedCourse?.id) {
      fetchHoles(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("golf_courses")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoles = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("holes")
        .select("*")
        .eq("course_id", courseId)
        .order("hole_number");

      if (error) throw error;
      setHoles(data || []);
    } catch (error) {
      console.error("Error fetching holes:", error);
    }
  };

  const addCourse = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("debug here user", user);
      if (!user) return;

      // First create the course
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .insert({
          name: newCourseName,
          user_id: user.id,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Then automatically create all 18 holes
      const holesToCreate = Array.from({ length: 18 }, (_, i) => ({
        course_id: courseData.id,
        hole_number: i + 1,
      }));

      const { error: holesError } = await supabase
        .from("holes")
        .insert(holesToCreate);

      if (holesError) throw holesError;

      setNewCourseName("");
      setShowAddCourse(false);
      fetchCourses();

      // Auto-select the new course
      setSelectedCourse(courseData);
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const addHole = async () => {
    if (!selectedCourse?.id) {
      console.error("No course selected");
      return;
    }

    try {
      // Create all 18 holes at once
      const holesToCreate = Array.from({ length: 18 }, (_, i) => ({
        course_id: selectedCourse.id,
        hole_number: i + 1,
      }));

      const { error } = await supabase.from("holes").insert(holesToCreate);

      if (error) throw error;

      setShowAddHole(false);
      if (selectedCourse?.id) {
        fetchHoles(selectedCourse.id);
      }
    } catch (error) {
      console.error("Error adding holes:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process...");

      // Clear any local storage or session data
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        console.log("Sign out successful, redirecting...");

        // Verify the user is actually signed out
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log("User confirmed signed out, redirecting...");
          // Force redirect to home page after sign out
          window.location.href = "/";
        } else {
          console.log("User still authenticated, trying again...");
          // Try one more time
          await supabase.auth.signOut();
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if there's an error, try to redirect
      window.location.href = "/";
    }
  };

  const goToNextHole = () => {
    if (holes.length > 0 && currentHoleIndex < holes.length - 1) {
      const nextIndex = currentHoleIndex + 1;
      setCurrentHoleIndex(nextIndex);
      setSelectedHole(holes[nextIndex].id);
    }
  };

  const goToPreviousHole = () => {
    if (holes.length > 0 && currentHoleIndex > 0) {
      const prevIndex = currentHoleIndex - 1;
      setCurrentHoleIndex(prevIndex);
      setSelectedHole(holes[prevIndex].id);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Golf Stats Dashboard
            </h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course & Hole Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Selection */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setCourseSectionCollapsed(!courseSectionCollapsed)
                }
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Golf Course
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddCourse(!showAddCourse);
                    }}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Add Course
                  </button>
                  <div
                    className={`transform transition-transform duration-200 ${
                      courseSectionCollapsed ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {!courseSectionCollapsed && (
                <div className="px-4 pb-4 space-y-4">
                  {selectedCourse && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Active Course:</span>{" "}
                        {selectedCourse?.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Course will stay selected until you change it
                      </p>
                    </div>
                  )}

                  {showAddCourse && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Course name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={addCourse}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowAddCourse(false)}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={selectedCourse?.id || ""}
                    onChange={(e) => {
                      const course = courses.find(
                        (c) => c.id === e.target.value
                      );
                      setSelectedCourse(course || null);
                      setSelectedHole("");
                      setCurrentHoleIndex(0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Hole Selection */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setHoleSectionCollapsed(!holeSectionCollapsed)}
                >
                  <h2 className="text-lg font-semibold text-gray-900">Hole</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddHole(!showAddHole);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Setup Course
                    </button>
                    <div
                      className={`transform transition-transform duration-200 ${
                        holeSectionCollapsed ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {!holeSectionCollapsed && (
                  <div className="px-4 pb-4 space-y-4">
                    {showAddHole && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 mb-3">
                          This will create all 18 holes for the course. You can
                          then navigate between holes using the Next/Previous
                          buttons.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={addHole}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Create All 18 Holes
                          </button>
                          <button
                            onClick={() => setShowAddHole(false)}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <select
                      value={selectedHole}
                      onChange={(e) => {
                        const holeId = e.target.value;
                        setSelectedHole(holeId);
                        // Find the index of the selected hole
                        const holeIndex = holes.findIndex(
                          (hole) => hole.id === holeId
                        );
                        setCurrentHoleIndex(holeIndex >= 0 ? holeIndex : 0);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 text-gray-900 placeholder-gray-500"
                    >
                      <option value="">Select a hole</option>
                      {holes.map((hole) => (
                        <option key={hole.id} value={hole.id}>
                          Hole {hole.hole_number}
                        </option>
                      ))}
                    </select>

                    {/* Hole Progress */}
                    {selectedHole && holes.length > 0 ? (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">
                              Hole {holes[currentHoleIndex]?.hole_number}
                            </span>{" "}
                            of {holes.length}
                          </p>
                          <div className="flex gap-1">
                            {holes.slice(0, 9).map((hole, index) => (
                              <button
                                key={hole.id}
                                onClick={() => {
                                  setCurrentHoleIndex(index);
                                  setSelectedHole(hole.id);
                                }}
                                className={`w-6 h-6 text-xs rounded ${
                                  currentHoleIndex === index
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-100 text-blue-700 hover:bg-gray-200"
                                }`}
                              >
                                {hole.hole_number}
                              </button>
                            ))}
                          </div>
                        </div>
                        {holes.length > 9 && (
                          <p className="text-xs text-blue-600 mt-1 text-center">
                            Tap hole numbers to jump directly
                          </p>
                        )}
                      </div>
                    ) : selectedCourse && holes.length === 0 ? (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800 text-center">
                          Click &quot;Setup Course&quot; to create all 18 holes
                        </p>
                      </div>
                    ) : null}

                    {/* Hole Navigation */}
                    {selectedHole && holes.length > 1 ? (
                      <div className="flex gap-2">
                        <button
                          onClick={goToPreviousHole}
                          disabled={currentHoleIndex === 0}
                          className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                          ← Previous Hole
                        </button>
                        <button
                          onClick={goToNextHole}
                          disabled={currentHoleIndex === holes.length - 1}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
                        >
                          Next Hole →
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Green Reading */}
          <div className="lg:col-span-2">
            {selectedHole ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Record Green Reading
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedForm("ultra")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          selectedForm === "ultra"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Ultra Quick
                      </button>
                      <button
                        onClick={() => setSelectedForm("quick")}
                        className={`px-3 py-1 text-sm rounded-md ${
                          selectedForm === "quick"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Wizard
                      </button>
                    </div>
                  </div>

                  {selectedForm === "ultra" ? (
                    <UltraQuickForm
                      holeId={selectedHole}
                      onSuccess={() => {
                        const event = new Event("refresh-readings");
                        window.dispatchEvent(event);
                      }}
                    />
                  ) : (
                    <QuickGreenReadingForm
                      holeId={selectedHole}
                      onSuccess={() => {
                        // Refresh the readings list
                        const event = new Event("refresh-readings");
                        window.dispatchEvent(event);
                      }}
                    />
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Previous Green Readings
                  </h2>
                  <GreenReadingList holeId={selectedHole} />
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Course and Hole
                </h2>
                <p className="text-gray-600">
                  Choose a golf course and hole to start recording green
                  readings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
