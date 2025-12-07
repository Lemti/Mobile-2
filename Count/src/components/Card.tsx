// src/components/Card.tsx
import React from 'react';
import { View } from 'react-native';

export default function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ backgroundColor:'#111318', borderRadius:16, padding:16 }, style]}>{children}</View>
  );
}
