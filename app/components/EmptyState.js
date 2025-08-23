import { Image, CheckCircle } from 'lucide-react';

export default function EmptyState({ hero = null, entity = 'items', title, description }) {
  const heading = title ?? `No ${entity} found yet.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {hero}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-foreground">{entity}</h2>
        <div className="p-6 rounded border bg-card/80 backdrop-blur border-border text-card-foreground flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-center max-w-xl">
            <h3 className="text-lg font-semibold text-card-foreground">{heading}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
