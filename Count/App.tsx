// App.tsx (ou index principal)
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ToastProvider } from "./src/components/useToast";

export default function App() {
  return (
    <ToastProvider>
      <AppNavigator />
    </ToastProvider>
  );
}
