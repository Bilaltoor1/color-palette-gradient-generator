"use client";

import { useState, useEffect } from "react";

let notifyFn = null;

export function mountToast(notify) {
  notifyFn = notify;
}

export function showToast(message, type = "info") {
  if (notifyFn) notifyFn({ message, type });
}

export default function SimpleToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    mountToast((t) => setToast(t));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(id);
  }, [toast]);

  if (!toast) return null;
  const bg = toast.type === "error" ? "bg-red-600" : "bg-emerald-600";
  return (
    <div className={`fixed right-4 bottom-6 z-50 ${bg} text-white px-4 py-2 rounded-md shadow-sm`}>
      {toast.message}
    </div>
  );
}
