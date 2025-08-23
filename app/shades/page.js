import Link from "next/link";
import EmptyState from '@/components/EmptyState';

function origin() {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  if (typeof window !== 'undefined') return window.location.origin;
  return `http://localhost:${process.env.PORT || 3000}`;
}

async function fetchShades() {
  const res = await fetch(`${origin()}/api/shades`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ShadesIndexPage() {
  const items = await fetchShades();

  // Hero + intro section (matches other pages)
  // Title: "Color Shades" and the requested descriptive paragraph
  const hero = (
    <section
      className="w-full"
      style={{
        background: 'linear-gradient(45deg, #1A047F 0% 9.09%, #2A079A 9.09% 18.18%, #3A0BAF 18.18% 27.27%, #4A0FC4 27.27% 36.36%, #5A14D6 36.36% 45.45%, #8F4CFF 45.45% 54.54%, #C47BFF 54.54% 63.63%, #D6A6FF 63.63% 72.72%, #E2C2FF 72.72% 81.81%, #EDD9FF 81.81% 90.9%, #F4EBFF 90.9% 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">Color Shades</h1>
        <p className="mt-3 text-white/90 max-w-2xl">
          Color shades are lighter and darker variations of a particular color, created by adding white or black respectively, however, “shade” is often used to refer the whole range of color variants.
        </p>
      </div>
    </section>
  );

  if (!items || items.length === 0) {
    return (
      <EmptyState
        hero={hero}
        entity="Color Shade Collections"
        title="No collections found"
        description="No collections found yet. Create one in the admin dashboard."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {hero}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-foreground">Color Shade Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((collection) => (
            <Link key={collection._id} href={`/shades/${collection.slug}`}
              className="group rounded-md border border-border overflow-hidden hover:shadow-md transition bg-card/80 backdrop-blur">
              <div className="flex flex-col">
                {(collection.colors || []).slice(0, 7).map((color, i) => (
                  <div key={i} className="w-full h-10" style={{ backgroundColor: color.hex }} title={`${color.name}: ${color.hex}`} />
                ))}
                {Array.from({ length: Math.max(0, 7 - (collection.colors?.length || 0)) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-full h-10 bg-muted" />
                ))}
              </div>
              <div className="p-4">
                <h3 className="text-base font-black leading-none text-card-foreground">{collection.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
