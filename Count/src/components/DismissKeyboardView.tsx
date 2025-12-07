// src/components/DismissKeyboardView.tsx
import React from 'react';
import {
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  ViewProps,
} from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
  keyboardOffset?: number; // Ajustable pour chaque écran si besoin
};

export default function DismissKeyboardView({
  children,
  style,
  keyboardOffset = 70, // Valeur safe par défaut
  ...rest
}: Props) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}
      {...rest}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
