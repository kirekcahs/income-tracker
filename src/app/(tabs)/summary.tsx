import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { Entry, todayStr, getSummary } from "../../lib/types";
import { loadEntries } from "../../lib/storage";
import { colors, money } from "../../constants/colors";

export default function Summary() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEntries().then(setEntries);
    }, [])
  );

  const { spent, revenue, profit, stockLeft } = getSummary(entries, todayStr());

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{todayStr()}</Text>

      <View style={styles.profitCard}>
        <Text style={styles.profitLabel}>{profit >= 0 ? "Profit" : "Loss"}</Text>
        <Text style={styles.profitValue}>{money(Math.abs(profit))}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { borderTopColor: colors.yellow }]}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>{money(revenue)}</Text>
        </View>
        <View style={[styles.card, { borderTopColor: colors.red }]}>
          <Text style={styles.label}>Spent on stock</Text>
          <Text style={[styles.value, { color: colors.red }]}>{money(spent)}</Text>
        </View>
      </View>

      <View style={[styles.card, { borderTopColor: colors.red, marginTop: 12 }]}>
        <Text style={styles.label}>Unsold stock (at cost)</Text>
        <Text style={styles.value}>{money(stockLeft)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  date: { fontSize: 14, fontWeight: "700", color: colors.muted, marginBottom: 12 },
  profitCard: { backgroundColor: colors.yellow, borderRadius: 20, padding: 24, marginBottom: 16, alignItems: "center" },
  profitLabel: { fontSize: 14, fontWeight: "700", color: colors.redDark },
  profitValue: { fontSize: 40, fontWeight: "900", color: colors.text },
  row: { flexDirection: "row", gap: 12 },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, borderTopWidth: 4 },
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: "800", color: colors.text },
});