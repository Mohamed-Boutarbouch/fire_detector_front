import { useState } from "react";

import { supabase } from "../supabaseClient";

import { Area, Camera, Direction } from "../types";

export function useSupabaseService() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);

  async function getAreas() {
    const { data, error } = await supabase.from("areas").select();

    if (error) {
      console.error("Error fetching areas:", error);
    } else {
      setAreas((data as Area[]) ?? []);
    }
  }

  async function getCameras() {
    const { data, error } = await supabase.from("cameras").select();

    if (error) {
      console.error("Error fetching cameras:", error);
    } else {
      setCameras((data as Camera[]) ?? []);
    }
  }

  async function getDirections() {
    const { data, error } = await supabase.from("directions").select();

    if (error) {
      console.error("Error fetching directions:", error);
    } else {
      setDirections((data as Direction[]) ?? []);
    }
  }

  return {
    getAreas,
    getCameras,
    getDirections,
    areas,
    cameras,
    directions,
  };
}
