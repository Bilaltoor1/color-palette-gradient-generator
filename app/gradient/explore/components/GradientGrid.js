"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildGradientCss, applyRgbOffset, buildTailwindClass } from "@/lib/gradients";
import { Download } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RiCss3Fill, RiTailwindCssFill } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { useGradientControls } from './GradientControlsContext';

// Time ago formatter
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

export default function GradientGrid({ initialItems, hasMore, currentPage, totalPages, total, categories, selectedCategory, currentSort }) {
  const router = useRouter();
  const { rgbShuffle, offset, angle, type } = useGradientControls();

  const handleLoadMore = () => {
    const params = new URLSearchParams();
    
    // Only add the specific parameters we need
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (currentSort && currentSort !== 'newest') {
      params.set('sort', currentSort);
    }
    params.set('page', (currentPage + 1).toString());
    
    const queryString = params.toString();
    router.push(`/gradient/explore?${queryString}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    
    // Only add the specific parameters we need
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (currentSort && currentSort !== 'newest') {
      params.set('sort', currentSort);
    }
    params.set('page', newPage.toString());
    
    const queryString = params.toString();
    router.push(`/gradient/explore?${queryString}`);
  };

  // Apply RGB shuffle to a hex color
  const shuffleRgb = (hex, shuffle) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    let newR, newG, newB;
    switch (shuffle) {
      case "rbg": [newR, newG, newB] = [r, b, g]; break;
      case "grb": [newR, newG, newB] = [g, r, b]; break;
      case "gbr": [newR, newG, newB] = [g, b, r]; break;
      case "brg": [newR, newG, newB] = [b, r, g]; break;
      case "bgr": [newR, newG, newB] = [b, g, r]; break;
      default: [newR, newG, newB] = [r, g, b]; break;
    }

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const adjusted = (g) => {
    const stops = (g.stops || []).map(s => ({
      ...s,
      color: applyRgbOffset(shuffleRgb(s.color, rgbShuffle), offset)
    }));
    return { ...g, type, angle, stops };
  };

  const copyCss = async (g) => {
    const css = buildGradientCss(adjusted(g));
    await navigator.clipboard.writeText(`background: ${css};`);
    toast.success("CSS copied to clipboard!");
  };

  const copyTailwind = async (g) => {
    const css = buildGradientCss(adjusted(g));
    const tw = buildTailwindClass(css);
    await navigator.clipboard.writeText(tw);
    toast.success("Tailwind class copied to clipboard!");
  };

  async function exportImage(id, w, h, gradientName) {
    const el = document.getElementById(id);
    if (!el) return;

    const toastId = toast.loading("Preparing download...");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${gradientName}-gradient-${w}x${h}.png`;
      a.click();
      toast.dismiss(toastId);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to download image");
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialItems.map(g => {
          const a = adjusted({ ...g, angle, type });
          const css = buildGradientCss(a);
          const id = `grad-card-${g._id}`;
          return (
            <div key={g._id} className="group bg-card/80 backdrop-blur rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
              <div id={id} className="h-48 w-full" style={{ background: css }} />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(g.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCss(a)}
                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                  >
                    <RiCss3Fill className="w-4 h-4 mr-1" />
                    CSS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyTailwind(a)}
                    className="cursor-pointer hover:bg-cyan-50 hover:text-cyan-600 border-cyan-200"
                  >
                    <RiTailwindCssFill className="w-4 h-4 mr-1" />
                    Tailwind
                  </Button>
                  <ExportMenu onPick={(w, h) => exportImage(id, w, h, g.title)} />
                </div>

                {g.categories && g.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {g.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      return (
                        <Badge key={categoryId} variant="secondary" className="text-xs" style={{ backgroundColor: category?.color + '20', color: category?.color }}>
                          {category?.name || categoryId}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        {currentPage > 1 && (
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            variant="outline"
            className="cursor-pointer"
          >
            Previous
          </Button>
        )}
        
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({total} total)
        </span>
        
        {hasMore && (
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            variant="outline"
            className="cursor-pointer"
          >
            Next
          </Button>
        )}
      </div>
    </>
  );
}

function ExportMenu({ onPick }) {
  const [orientation, setOrientation] = useState("landscape");
  const options = [
    { label: "HD (1280x720)", w: 1280, h: 720 },
    { label: "FHD (1920x1080)", w: 1920, h: 1080 },
    { label: "2K (2560x1440)", w: 2560, h: 1440 },
    { label: "4K (3840x2160)", w: 3840, h: 2160 },
    { label: "Square (1080x1080)", w: 1080, h: 1080 },
    { label: "Mobile (1080x1920)", w: 1080, h: 1920 }
  ];

  const pick = async (o) => {
    const dims = orientation === "portrait" ? { w: o.h, h: o.w } : { w: o.w, h: o.h };
    await onPick(dims.w, dims.h);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border-green-200 dark:border-green-800"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56 bg-card text-card-foreground border border-border rounded-lg shadow-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Orientation</span>
          <select
            className="text-sm border rounded px-2 py-1 cursor-pointer bg-card text-card-foreground border-border"
            value={orientation}
            onChange={e => setOrientation(e.target.value)}
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </select>
        </div>

        <div className="space-y-1">
          {options.map(o => (
            <DropdownMenuItem key={o.label} onSelect={() => pick(o)} className="text-sm px-3 py-2 rounded">
              {o.label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
