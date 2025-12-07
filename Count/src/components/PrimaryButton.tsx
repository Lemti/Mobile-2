// src/components/PrimaryButton.tsx
import React from "react";
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { THEME } from "../theme";

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, onPress, disabled, loading, fullWidth = true, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: "#ffffff22" }}
      style={({ pressed }) => [
        styles.btn,
        fullWidth && { alignSelf: "stretch" },
        pressed && { transform: [{ scale: 0.995 }] },
        isDisabled && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.radii.lg,
    alignItems: "center",
    justifyContent: "center",
    ...THEME.shadow.style,
  },
  label: {
    color: THEME.colors.text,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
