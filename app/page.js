"use client";

import { useRouter } from "next/navigation";
import { Palette, Zap, ArrowRight } from "lucide-react";

const TOOLS = [
  { 
    id: "palette", 
    label: "Color Palette Generator", 
    icon: Palette,
    description: "Build palettes like Canva: complementary, monochromatic, analogous, triadic, and tetradic.",
    route: "/palette",
    gradient: "from-blue-400 to-purple-600"
  },
  { 
    id: "gradient", 
    label: "Gradient Generator", 
    icon: Zap,
    description: "Create beautiful gradients with multiple color stops, linear and radial types.",
    route: "/gradient",
    gradient: "from-purple-400 via-pink-500 to-red-500"
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow mb-6">
            Color Studio
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Professional color tools for designers and developers. Create stunning palettes and gradients with ease.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative overflow-hidden rounded-2xl border border-border hover:border-border/80 transition-all duration-300 hover:shadow-xl"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                {/* Content */}
                <div className="relative p-8 bg-card/80 backdrop-blur">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} text-white`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold mb-2 text-card-foreground">{tool.label}</h2>
                      <p className="text-muted-foreground mb-6">{tool.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push(tool.route)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors group-hover:scale-105 transform duration-200"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2 text-card-foreground">Multiple Color Schemes</h3>
              <p className="text-sm text-muted-foreground">Complementary, triadic, analogous, and more</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2 text-card-foreground">Export Options</h3>
              <p className="text-sm text-muted-foreground">PDF export and CSS code generation</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2 text-card-foreground">Interactive Tools</h3>
              <p className="text-sm text-muted-foreground">Drag and drop color selectors</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur border border-border">
              <h3 className="font-semibold mb-2 text-card-foreground">Responsive Design</h3>
              <p className="text-sm text-muted-foreground">Works perfectly on all devices</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
