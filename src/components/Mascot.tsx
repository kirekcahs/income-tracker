import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

type Props = { profit: number };

// Later you can make a different image per mood and swap them in here
const images = {
  happy: require("../../assets/images/mascot.png"),
  neutral: require("../../assets/images/mascot.png"),
  sad: require("../../assets/images/mascot.png"),
};

export default function Mascot({ profit }: Props) {
  const mood = profit > 0 ? "happy" : profit < 0 ? "sad" : "neutral";

  const message =
    mood === "happy"
      ? "Yay, you're making profit today!"
      : mood === "sad"
      ? "Oh no... check your prices. You got this!"
      : "Let's start selling today!";

  // gentle bobbing animation
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -5, duration: 700, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  return (
    <View style={styles.wrap}>
  
      <Animated.Image
        source={images[mood]}
        style={[styles.mascot, { transform: [{ translateY: bob }] }]}
        resizeMode="contain"
      />

    <View style={styles.bubble}>
        <Text style={styles.message}>{message}</Text>
    </View>  
    </View>
    
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center" },
  mascot: { width: 100, height: 100 },
  bubble: {
    flex: 1,
    backgroundColor: colors.yellowSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },

  message: { fontSize: 14, fontWeight: "600", color: colors.text },
});