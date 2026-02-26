"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        richColors={false}
        closeButton
        toastOptions={{
          style: {
            background: "#111111",
            color: "#f4f4f5",
            border: "1px solid #2a2a2a",
          },
        }}
      />
    </>
  );
}
