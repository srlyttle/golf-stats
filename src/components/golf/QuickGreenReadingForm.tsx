"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface QuickGreenReadingFormProps {
  holeId: string;
  onSuccess?: () => void;
}

interface DirectionData {
  approach: "front" | "back" | "left" | "right";
  break: string;
  notes: string;
}

export default function QuickGreenReadingForm({
  holeId,
  onSuccess,
}: QuickGreenReadingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pin_position: "",
    distance_on: "",
    distance_from_side: "",
    side_from: "middle" as const,
    directions: {
      front: { approach: "front" as const, break: "", notes: "" },
      back: { approach: "back" as const, break: "", notes: "" },
      left: { approach: "left" as const, break: "", notes: "" },
      right: { approach: "right" as const, break: "", notes: "" },
    },
  });

  const handleSubmit = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Create 4 green readings (one for each direction)
      const readings = Object.values(formData.directions).map((direction) => ({
        hole_id: holeId,
        user_id: user.id,
        pin_position: formData.pin_position,
        distance_on: parseInt(formData.distance_on),
        distance_from_side: parseInt(formData.distance_from_side),
        side_from: formData.side_from,
        approach_direction: direction.approach,
        break_description: direction.break,
        notes: direction.notes,
      }));

      // Insert all readings
      const { error } = await supabase.from("green_readings").insert(readings);

      if (error) throw error;

      // Reset form and go back to step 1
      setFormData({
        pin_position: "",
        distance_on: "",
        distance_from_side: "",
        side_from: "middle",
        directions: {
          front: { approach: "front", break: "", notes: "" },
          back: { approach: "back", break: "", notes: "" },
          left: { approach: "left", break: "", notes: "" },
          right: { approach: "right", break: "", notes: "" },
        },
      });
      setStep(1);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving green readings:", error);
    }
  };

  const updateDirection = (
    direction: keyof typeof formData.directions,
    field: keyof DirectionData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      directions: {
        ...prev.directions,
        [direction]: {
          ...prev.directions[direction],
          [field]: value,
        },
      },
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Step 1: Pin Position & Distances
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pin Position
          </label>
          <input
            type="text"
            value={formData.pin_position}
            onChange={(e) =>
              setFormData({ ...formData, pin_position: e.target.value })
            }
            placeholder="e.g., Back tier rightish"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance On (yards)
          </label>
          <input
            type="number"
            value={formData.distance_on}
            onChange={(e) =>
              setFormData({ ...formData, distance_on: e.target.value })
            }
            placeholder="33"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance From Side (yards)
          </label>
          <input
            type="number"
            value={formData.distance_from_side}
            onChange={(e) =>
              setFormData({ ...formData, distance_from_side: e.target.value })
            }
            placeholder="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Side From
          </label>
          <select
            value={formData.side_from}
            onChange={(e) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setFormData({ ...formData, side_from: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="middle">Middle</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={
          !formData.pin_position ||
          !formData.distance_on ||
          !formData.distance_from_side
        }
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Next: Enter Break Data
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Step 2: Break Data for All Directions
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Front */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Front Approach</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break
              </label>
              <input
                type="text"
                value={formData.directions.front.break}
                onChange={(e) =>
                  updateDirection("front", "break", e.target.value)
                }
                placeholder="e.g., Straightish downhill"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.directions.front.notes}
                onChange={(e) =>
                  updateDirection("front", "notes", e.target.value)
                }
                placeholder="Quick notes..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Back Approach</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break
              </label>
              <input
                type="text"
                value={formData.directions.back.break}
                onChange={(e) =>
                  updateDirection("back", "break", e.target.value)
                }
                placeholder="e.g., Downhill from left"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.directions.back.notes}
                onChange={(e) =>
                  updateDirection("back", "notes", e.target.value)
                }
                placeholder="Quick notes..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Left */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-3">Left Approach</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break
              </label>
              <input
                type="text"
                value={formData.directions.left.break}
                onChange={(e) =>
                  updateDirection("left", "break", e.target.value)
                }
                placeholder="e.g., Come from right side"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.directions.left.notes}
                onChange={(e) =>
                  updateDirection("left", "notes", e.target.value)
                }
                placeholder="Quick notes..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-900 mb-3">Right Approach</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break
              </label>
              <input
                type="text"
                value={formData.directions.right.break}
                onChange={(e) =>
                  updateDirection("right", "break", e.target.value)
                }
                placeholder="e.g., Slightly from left"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.directions.right.notes}
                onChange={(e) =>
                  updateDirection("right", "notes", e.target.value)
                }
                placeholder="Quick notes..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save All 4 Readings
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Green Reading
          </h2>
          <div className="text-sm text-gray-500">Step {step} of 2</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
}
