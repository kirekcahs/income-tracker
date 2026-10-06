import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { Entry, getSummary } from "../../lib/types";
import { loadEntries } from "../../lib/storage";
import { colors, money } from "../../constants/colors";

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEntries().then(setEntries);
    }, [])
  );

  const days = Array.from(new Set(entries.map((e) => e.date))).sort().reverse();
  const rows = days.map((date) => ({ date, ...getSummary(entries, date) }));
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={rows}
      keyExtractor={(r) => r.date}
      ListHeaderComponent={
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>All-time profit</Text>
          <Text style={styles.totalValue}>{money(totalProfit)}</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No days logged yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.sub}>
              Revenue {money(item.revenue)} · Spent {money(item.spent)}
            </Text>
          </View>
          <Text style={[styles.profit, { color: item.profit >= 0 ? colors.text : colors.red }]}>
            {item.profit >= 0 ? "+" : ""}{money(item.profit)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  totalCard: { backgroundColor: colors.yellow, borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 16 },
  totalLabel: { fontSize: 14, fontWeight: "700", color: colors.redDark },
  totalValue: { fontSize: 34, fontWeight: "900", color: colors.text },
  empty: { color: colors.muted, textAlign: "center", marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  date: { fontSize: 15, fontWeight: "700", color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  profit: { fontSize: 17, fontWeight: "800" },
});