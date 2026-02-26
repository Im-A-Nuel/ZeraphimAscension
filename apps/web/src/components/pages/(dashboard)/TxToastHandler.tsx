"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTxStore } from "@/stores";

export const TxToastHandler = () => {
  const toastEvent = useTxStore((state) => state.lastToastEvent);
  const txDigest = useTxStore((state) => state.txDigest);
  const handled = useRef<string | null>(null);
  const sharedToastId = useRef<string>("tx-progress");

  useEffect(() => {
    if (!toastEvent || handled.current === toastEvent.id) {
      return;
    }

    handled.current = toastEvent.id;

    if (toastEvent.status === "pending") {
      toast.loading(toastEvent.message, { id: sharedToastId.current });
      return;
    }

    if (toastEvent.status === "success") {
      toast.success(txDigest ? `${toastEvent.message} (${txDigest})` : toastEvent.message, {
        id: sharedToastId.current,
      });
      return;
    }

    if (toastEvent.status === "error") {
      toast.error(toastEvent.message, { id: sharedToastId.current });
    }
  }, [toastEvent, txDigest]);

  return null;
};
