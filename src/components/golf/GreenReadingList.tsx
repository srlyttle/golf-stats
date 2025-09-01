"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { GreenReading } from "@/lib/database.types";

interface GreenReadingListProps {
  holeId: string;
}

export default function GreenReadingList({ holeId }: GreenReadingListProps) {
  const [readings, setReadings] = useState<GreenReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPin, setSearchPin] = useState("");

  useEffect(() => {
    fetchReadings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holeId]);

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from("green_readings")
        .select("*")
        .eq("hole_id", holeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error("Error fetching readings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReadings = readings.filter((reading) =>
    reading.pin_position.toLowerCase().includes(searchPin.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Pin Position
        </label>
        <input
          type="text"
          value={searchPin}
          onChange={(e) => setSearchPin(e.target.value)}
          placeholder="e.g., back tier, middle"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {filteredReadings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchPin
            ? "No readings match your search"
            : "No green readings recorded yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReadings.map((reading) => (
            <div
              key={reading.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">
                  {reading.pin_position}
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(reading.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Distance On:</span>{" "}
                  {reading.distance_on} yards
                </div>
                <div>
                  <span className="font-medium">From Side:</span>{" "}
                  {reading.distance_from_side} yards {reading.side_from}
                </div>
                <div>
                  <span className="font-medium">Approach:</span>{" "}
                  {reading.approach_direction}
                </div>
              </div>

              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">Break:</div>
                <p className="mb-2">{reading.break_description}</p>
                {reading.notes && (
                  <>
                    <div className="font-medium mb-1">Notes:</div>
                    <p className="text-gray-600">{reading.notes}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
