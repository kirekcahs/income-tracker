import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

type Props = { title: string; onPress: () => void; variant?: "red" | "yellow" };

export default function AppButton({ title, onPress, variant = "red" }: Props) {
  const isRed = variant === "red";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: isRed ? colors.red : colors.yellow },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.text, { color: isRed ? "#fff" : colors.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  text: { fontSize: 16, fontWeight: "700" },
});