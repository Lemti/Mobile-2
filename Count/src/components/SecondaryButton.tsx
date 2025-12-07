// src/components/SecondaryButton.tsx
import React from "react";
import { GestureResponderEvent, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { THEME } from "../theme";

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function SecondaryButton({ title, onPress, fullWidth = true, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#ffffff18" }}
      style={({ pressed }) => [
        styles.btn,
        fullWidth && { alignSelf: "stretch" },
        pressed && { backgroundColor: "#1a1d24" },
        style,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 14,
    borderRadius: THEME.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: THEME.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
});
