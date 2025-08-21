"use client";
import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ColorCard({ color }) {
  const name = color?.name || color?.hex || '';
  const hex = color?.hex || '';

  const copyHex = async (e) => {
    e?.stopPropagation?.();
    try {
      await navigator.clipboard.writeText(hex);
      toast.success('Hex copied');
    } catch (err) {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="overflow-hidden rounded-md bg-white shadow-sm">
      <div className="w-full aspect-[2/1] relative" style={{ backgroundColor: hex }} />
      <div className="flex justify-between items-center pl-4 pr-2 py-2">
        <h3 className="text-base font-black leading-none">{name}</h3>
        <button onClick={copyHex} aria-label={`Copy ${hex}`} className="inline-flex items-center justify-center gap-2 rounded-sm text-base font-medium transition hover:bg-neutral-100 p-2">
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
