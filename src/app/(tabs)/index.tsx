import { useCallback, useState } from "react";
import Mascot from "../../components/Mascot";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Entry, todayStr, getSummary } from "../../lib/types";
import { loadEntries, saveEntries } from "../../lib/storage";
import { colors, money } from "../../constants/colors";
import AppButton from "../../components/AppButton";

type ModalType = null | "item" | "income";

export default function Today() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [income, setIncome] = useState("");
  const [incomeName, setIncomeName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadEntries().then(setEntries);
    }, [])
  );

  const today = todayStr();
  const todays = entries.filter((e) => e.date === today);
  const { revenue, profit } = getSummary(entries, today);

  const persist = (next: Entry[]) => {
    setEntries(next);
    saveEntries(next);
  };

  const openModal = (type: ModalType) => {
    setError("");
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const addItem = () => {
    if (!name.trim() || !qty || !cost || !sellPrice) {
      setError("Please fill in all fields.");
      return;
    }
    persist([
      ...entries,
      {
        id: Date.now().toString(),
        date: today,
        type: "item",
        name: name.trim(),
        qty: Number(qty),
        cost: Number(cost),
        sellPrice: Number(sellPrice),
        sold: 0,
      },
    ]);
    setName(""); setQty(""); setCost(""); setSellPrice("");
    closeModal();
  };

  const addIncome = () => {
    if (!income) {
      setError("Enter an amount.");
      return;
    }
    persist([
      ...entries,
      {
        id: Date.now().toString(),
        date: today,
        type: "income",
        amount: Number(income),
        note: incomeName.trim() || "Other income", // falls back if left blank
      },
    ]);
    setIncome("");
    setIncomeName("");
    closeModal();
  };

  const changeSold = (id: string, delta: number) => {
    persist(
      entries.map((e) =>
        e.id === id && e.type === "item"
          ? { ...e, sold: Math.min(e.qty, Math.max(0, e.sold + delta)) }
          : e
      )
    );
  };

  const remove = (id: string) => persist(entries.filter((e) => e.id !== id));

  const perPiece = Number(sellPrice) - Number(cost);
  const showPreview = cost !== "" && sellPrice !== "";

  const header = (
    <View>
      <View style={styles.banner}>
        <Text style={styles.bannerDate}>{today}</Text>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.bannerLabel}>Revenue</Text>
            <Text style={styles.bannerValue}>{money(revenue)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.bannerLabel}>Profit</Text>
            <Text style={[styles.bannerValue, { color: colors.yellow }]}>{money(profit)}</Text>
          </View>
        </View>
      </View>
       <Mascot profit={profit} />
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <AppButton title="+ Add item" onPress={() => openModal("item")} />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton title="+ Income" variant="yellow" onPress={() => openModal("income")} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's items</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        data={todays}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>Nothing logged yet today.</Text>}
        renderItem={({ item }) =>
          item.type === "item" ? (
            <View style={styles.entry}>
              <View style={[styles.bar, { backgroundColor: colors.red }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.entryTitle}>{item.name}</Text>
                <Text style={styles.entrySub}>
                  {money(item.cost)} → {money(item.sellPrice)}
                </Text>
                <Text style={styles.entrySub}>
                  Profit {money(item.sold * (item.sellPrice - item.cost))}
                </Text>
              </View>
              <View style={styles.counter}>
                <Pressable style={styles.round} onPress={() => changeSold(item.id, -1)}>
                  <Text style={styles.roundText}>−</Text>
                </Pressable>
                <Text style={styles.soldText}>{item.sold}/{item.qty}</Text>
                <Pressable style={[styles.round, styles.roundYellow]} onPress={() => changeSold(item.id, 1)}>
                  <Text style={styles.roundText}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => remove(item.id)} hitSlop={10}>
                <Text style={styles.x}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.entry}>
              <View style={[styles.bar, { backgroundColor: colors.yellow }]} />
              <Text style={[styles.entryTitle, { flex: 1 }]}>{item.note}</Text>
              <Text style={styles.entryTitle}>+{money(item.amount)}</Text>
              <Pressable onPress={() => remove(item.id)} hitSlop={10}>
                <Text style={styles.x}>✕</Text>
              </Pressable>
            </View>
          )
        }
      />

      {/* Bottom-sheet modal */}
      <Modal visible={modal !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={{ flex: 1 }} onPress={closeModal} />
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {modal === "item" && (
              <>
                <Text style={styles.sheetTitle}>Add item</Text>

                <Text style={styles.label}>Item name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fish ball"
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />

                <View style={styles.row}>
                  <View style={styles.third}>
                    <Text style={styles.label}>Qty</Text>
                    <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.muted} keyboardType="numeric" value={qty} onChangeText={setQty} />
                  </View>
                  <View style={styles.third}>
                    <Text style={styles.label}>Cost / piece</Text>
                    <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.muted} keyboardType="numeric" value={cost} onChangeText={setCost} />
                  </View>
                  <View style={styles.third}>
                    <Text style={styles.label}>Sell / piece</Text>
                    <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.muted} keyboardType="numeric" value={sellPrice} onChangeText={setSellPrice} />
                  </View>
                </View>

                {showPreview && (
                  <Text style={[styles.preview, { color: perPiece >= 0 ? colors.text : colors.red }]}>
                    Profit per piece: {money(perPiece)}
                  </Text>
                )}
                {error !== "" && <Text style={styles.error}>{error}</Text>}

                <AppButton title="Add item" onPress={addItem} />
                <Pressable onPress={closeModal} style={styles.cancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}

            {modal === "income" && (
              <>
                <Text style={styles.sheetTitle}>Other income</Text>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tip, Delivery fee"
                  placeholderTextColor={colors.muted}
                  value={incomeName}
                  onChangeText={setIncomeName}
                  autoFocus
                />

                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={income}
                  onChangeText={setIncome}
                />
                {error !== "" && <Text style={styles.error}>{error}</Text>}
                <AppButton title="Log income" variant="yellow" onPress={addIncome} />
                <Pressable onPress={closeModal} style={styles.cancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  banner: { backgroundColor: colors.red, borderRadius: 20, padding: 20, marginBottom: 16 },
  bannerDate: { color: colors.yellow, fontWeight: "700", marginBottom: 12 },
  bannerRow: { flexDirection: "row", justifyContent: "space-between" },
  bannerLabel: { color: "#FFD9D9", fontSize: 13 },
  bannerValue: { color: "#fff", fontSize: 26, fontWeight: "800" },

  actions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 8 },

  entry: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  bar: { width: 5, alignSelf: "stretch", borderRadius: 3, marginRight: 12 },
  entryTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  entrySub: { fontSize: 13, color: colors.muted },
  counter: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
  round: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.yellowSoft, alignItems: "center", justifyContent: "center" },
  roundYellow: { backgroundColor: colors.yellow },
  roundText: { fontSize: 18, fontWeight: "800", color: colors.text },
  soldText: { minWidth: 44, textAlign: "center", fontWeight: "700", color: colors.text },
  x: { color: colors.muted, fontSize: 16, paddingHorizontal: 4 },

  // modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: colors.red, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.muted, marginBottom: 4 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 12, color: colors.text },
  row: { flexDirection: "row", gap: 8 },
  third: { flex: 1 },
  preview: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  error: { color: colors.red, fontSize: 13, marginBottom: 8 },
  cancel: { alignItems: "center", paddingVertical: 12 },
  cancelText: { color: colors.muted, fontWeight: "600" },
});