"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface GreenReadingFormProps {
  holeId: string;
  onSuccess?: () => void;
}

export default function GreenReadingForm({
  holeId,
  onSuccess,
}: GreenReadingFormProps) {
  const [formData, setFormData] = useState({
    pin_position: "",
    distance_on: "",
    distance_from_side: "",
    side_from: "",
    approach_direction: "",
    break_description: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("green_readings").insert({
        hole_id: holeId,
        user_id: user.id,
        pin_position: formData.pin_position,
        distance_on: parseInt(formData.distance_on),
        distance_from_side: parseInt(formData.distance_from_side),
        side_from: formData.side_from,
        approach_direction: formData.approach_direction,
        break_description: formData.break_description,
        notes: formData.notes,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        pin_position: "",
        distance_on: "",
        distance_from_side: "",
        side_from: "middle",
        approach_direction: "front",
        break_description: "",
        notes: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error saving green reading:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              setFormData({ ...formData, side_from: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="middle">Middle</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Approach Direction
        </label>
        <select
          value={formData.approach_direction}
          onChange={(e) =>
            setFormData({
              ...formData,
              approach_direction: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Break Description
        </label>
        <textarea
          value={formData.break_description}
          onChange={(e) =>
            setFormData({ ...formData, break_description: e.target.value })
          }
          placeholder="e.g., From back downhill from left"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional observations..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Save Green Reading
      </button>
    </form>
  );
}
