import React from 'react';
import ColorCard from '../../components/ColorCard';

async function fetchShade(slug) {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : `http://localhost:${process.env.PORT || 3000}`);
  const res = await fetch(`${origin}/api/shades/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ShadeDetailPage({ params }) {
  const { hex: slug } = params;
  const collection = await fetchShade(slug);
  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-foreground">Collection not found</h1>
          <p className="text-muted-foreground">We couldn't find that collection. It may have been deleted or the slug is incorrect.</p>
        </div>
      </div>
    );
  }

  const colors = Array.isArray(collection.colors) ? collection.colors : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-foreground">{collection.title}</h1>
        {collection.description && (
          <p className="text-muted-foreground mb-6">{collection.description}</p>
        )}
        {colors.length === 0 ? (
          <div className="p-6 rounded border bg-card/80 backdrop-blur border-border text-card-foreground">No colors in this collection yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {colors.map((color, i) => (
              <ColorCard key={i} color={color} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
