// src/components/useToast.tsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { THEME } from "../theme";

type ToastType = "success" | "error" | "info";
type ToastOptions = { type?: ToastType; message: string; durationMs?: number };

type Ctx = { show: (opts: ToastOptions | string) => void };
const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [type, setType] = useState<ToastType>("info");
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(y, { toValue: 20, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [opacity, y]);

  const show = useCallback((opts: ToastOptions | string) => {
    const o = typeof opts === "string" ? { message: opts } : opts;
    setMsg(o.message);
    setType(o.type ?? "info");
    setVisible(true);
    hideTimer.current && clearTimeout(hideTimer.current);

    // animate in
    opacity.setValue(0);
    y.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    hideTimer.current = setTimeout(hide, o.durationMs ?? 2200);
  }, [hide, opacity, y]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {visible && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Pressable style={{ flex: 1 }} onPress={hide} />
          <Animated.View
            style={[
              styles.container,
              { opacity, transform: [{ translateY: y }] },
              typeStyle[type],
            ]}
          >
            <Text style={styles.text}>{msg}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: THEME.spacing(4),
    alignSelf: "center",
    maxWidth: "92%",
    paddingHorizontal: THEME.spacing(2),
    paddingVertical: THEME.spacing(1.5),
    borderRadius: THEME.radii.lg,
    ...THEME.shadow.style,
  },
  text: {
    color: THEME.colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
});

const typeStyle = StyleSheet.create({
  success: { backgroundColor: THEME.colors.primary },
  error:   { backgroundColor: THEME.colors.danger },
  info:    { backgroundColor: THEME.colors.info },
});
