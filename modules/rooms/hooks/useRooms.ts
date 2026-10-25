"use client";

import { useState, useEffect, useCallback } from "react";
import { Room, RoomFilterTab, RoomFormData } from "@/types/room";
import { roomService } from "@/modules/rooms/services/roomService";

// Hook untuk mengelola daftar kamar, filter, dan mutasi data kamar
export function useRooms(initialFilter: RoomFilterTab = "all") {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<RoomFilterTab>(initialFilter);
  const [error, setError] = useState<string | null>(null);

  // Memuat data kamar dari database
  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomService.getRooms(filterTab);
      setRooms(data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data kamar.");
    } finally {
      setIsLoading(false);
    }
  }, [filterTab]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Tambah kamar baru
  const addRoom = async (formData: RoomFormData) => {
    const newRoom = await roomService.createRoom(formData);
    setRooms((prev) => [...prev, newRoom]);
    return newRoom;
  };

  // Update data kamar
  const editRoom = async (id: string, updates: Partial<Room>) => {
    const updated = await roomService.updateRoom(id, updates);
    setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  // Hapus kamar
  const removeRoom = async (id: string) => {
    await roomService.deleteRoom(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    rooms,
    isLoading,
    filterTab,
    setFilterTab,
    error,
    refreshRooms: loadRooms,
    addRoom,
    editRoom,
    removeRoom,
  };
}
