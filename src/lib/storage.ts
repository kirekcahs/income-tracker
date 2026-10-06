import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entry } from "./types";

const KEY = "entries";

export async function loadEntries(): Promise<Entry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw).map((e: any) =>
    e.type === "item"
      ? { ...e, cost: e.cost ?? e.price ?? 0, sellPrice: e.sellPrice ?? 0, sold: e.sold ?? 0 }
      : e
  );
}

export async function saveEntries(entries: Entry[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}