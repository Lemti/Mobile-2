// src/components/TextField.tsx
import React from 'react';
import { TextInput, View, Text } from 'react-native';

type Props = {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  returnKeyType?: 'next'|'done';
  onSubmitEditing?: () => void;
};

export default function TextField(props: Props) {
  const { label, error } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      {!!label && <Text style={{ color:'#9aa0a6', marginBottom:6 }}>{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor="#64748b"
        style={{
          height: 52, borderRadius: 12, paddingHorizontal:14,
          backgroundColor:'#111318', color:'#fff', borderWidth:1,
          borderColor: error ? '#ef4444' : '#1f2937'
        }}
      />
      {!!error && <Text style={{ color:'#ef4444', marginTop:6 }}>{error}</Text>}
    </View>
  );
}
