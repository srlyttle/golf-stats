"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface UltraQuickFormProps {
  holeId: string;
  onSuccess?: () => void;
}

export default function UltraQuickForm({
  holeId,
  onSuccess,
}: UltraQuickFormProps) {
  const [formData, setFormData] = useState({
    pin_position: "",
    distance_on: "",
    distance_from_side: "",
    side_from: "middle" as const,
    front_break: "",
    back_break: "",
    left_break: "",
    right_break: "",
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

      // Create 4 green readings quickly
      const readings = [
        {
          hole_id: holeId,
          user_id: user.id,
          pin_position: formData.pin_position,
          distance_on: parseInt(formData.distance_on),
          distance_from_side: parseInt(formData.distance_from_side),
          side_from: formData.side_from,
          approach_direction: "front" as const,
          break_description: formData.front_break,
          notes: "",
        },
        {
          hole_id: holeId,
          user_id: user.id,
          pin_position: formData.pin_position,
          distance_on: parseInt(formData.distance_on),
          distance_from_side: parseInt(formData.distance_from_side),
          side_from: formData.side_from,
          approach_direction: "back" as const,
          break_description: formData.back_break,
          notes: "",
        },
        {
          hole_id: holeId,
          user_id: user.id,
          pin_position: formData.pin_position,
          distance_on: parseInt(formData.distance_on),
          distance_from_side: parseInt(formData.distance_from_side),
          side_from: formData.side_from,
          approach_direction: "left" as const,
          break_description: formData.left_break,
          notes: "",
        },
        {
          hole_id: holeId,
          user_id: user.id,
          pin_position: formData.pin_position,
          distance_on: parseInt(formData.distance_on),
          distance_from_side: parseInt(formData.distance_from_side),
          side_from: formData.side_from,
          approach_direction: "right" as const,
          break_description: formData.right_break,
          notes: "",
        },
      ];

      const { error } = await supabase.from("green_readings").insert(readings);

      if (error) throw error;

      // Reset form
      setFormData({
        pin_position: "",
        distance_on: "",
        distance_from_side: "",
        side_from: "middle",
        front_break: "",
        back_break: "",
        left_break: "",
        right_break: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error saving green readings:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ultra Quick Entry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top row - Pin position and distances */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pin
            </label>
            <input
              type="text"
              value={formData.pin_position}
              onChange={(e) =>
                setFormData({ ...formData, pin_position: e.target.value })
              }
              placeholder="Back tier"
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              On (yds)
            </label>
            <input
              type="number"
              value={formData.distance_on}
              onChange={(e) =>
                setFormData({ ...formData, distance_on: e.target.value })
              }
              placeholder="33"
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Side (yds)
            </label>
            <input
              type="number"
              value={formData.distance_from_side}
              onChange={(e) =>
                setFormData({ ...formData, distance_from_side: e.target.value })
              }
              placeholder="5"
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
        </div>

        {/* Side from selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            From Side
          </label>
          <select
            value={formData.side_from}
            onChange={(e) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setFormData({ ...formData, side_from: e.target.value as any })
            }
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="middle">Middle</option>
          </select>
        </div>

        {/* Break descriptions in a 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-blue-700 mb-1">
              Front
            </label>
            <input
              type="text"
              value={formData.front_break}
              onChange={(e) =>
                setFormData({ ...formData, front_break: e.target.value })
              }
              placeholder="Straight downhill"
              className="w-full px-2 py-2 text-sm border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-green-700 mb-1">
              Back
            </label>
            <input
              type="text"
              value={formData.back_break}
              onChange={(e) =>
                setFormData({ ...formData, back_break: e.target.value })
              }
              placeholder="Downhill left"
              className="w-full px-2 py-2 text-sm border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-yellow-700 mb-1">
              Left
            </label>
            <input
              type="text"
              value={formData.left_break}
              onChange={(e) =>
                setFormData({ ...formData, left_break: e.target.value })
              }
              placeholder="From right"
              className="w-full px-2 py-2 text-sm border border-yellow-200 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-red-700 mb-1">
              Right
            </label>
            <input
              type="text"
              value={formData.right_break}
              onChange={(e) =>
                setFormData({ ...formData, right_break: e.target.value })
              }
              placeholder="Slight left"
              className="w-full px-2 py-2 text-sm border border-red-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
        >
          Save All 4 Readings
        </button>
      </form>
    </div>
  );
}
