"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { buildGradientCss, applyRgbOffset, buildTailwindClass } from "@/lib/gradients";
import { Download } from "lucide-react";
import { RiCss3Fill, RiTailwindCssFill } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

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

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}

export default function ExploreGradientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("newest");
  const [rgbShuffle, setRgbShuffle] = useState("rgb"); // rgb, rbg, grb, gbr, brg, bgr
  const [offset, setOffset] = useState({ r: 0, g: 0, b: 0 });
  const [angle, setAngle] = useState(90);
  const [type, setType] = useState("linear");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    load(1, true);
  }, [sort]);

  async function load(nextPage = 1, replace = false) {
    try {
      const res = await fetch(`/api/gradients?page=${nextPage}&limit=20&sort=${sort}`);
      const { items: list, hasMore: more } = await res.json();
      setItems(prev => replace ? list : [...prev, ...list]);
      setHasMore(more);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load gradients:", error);
    } finally {
      setLoading(false);
    }
  }

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

  async function exportImage(id, w, h) {
    const el = document.getElementById(id);
    if (!el) return;

    toast.loading("Preparing download...");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `gradient-${w}x${h}.png`;
      a.click();
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  }

  const resolutions = [
    { label: "HD (1280x720)", w: 1280, h: 720 },
    { label: "FHD (1920x1080)", w: 1920, h: 1080 },
    { label: "2K (2560x1440)", w: 2560, h: 1440 },
    { label: "4K (3840x2160)", w: 3840, h: 2160 },
    { label: "Square (1080x1080)", w: 1080, h: 1080 },
    { label: "Mobile (1080x1920)", w: 1080, h: 1920 }
  ];

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Explore Gradients</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover beautiful gradients, customize them with RGB shuffle and controls, then copy CSS or export as images.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium xs:block hidden">Sort</span>
              <Select value={sort} onValueChange={v => setSort(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium xs:block hidden">Type</span>
              <Select value={type} onValueChange={v => setType(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="conic">Angular</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle Button for Filters */}
            <button
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <IoClose size={20} /> : <IoMenu size={20} />}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">R</span>
                <Slider
                  min={-64}
                  max={64}
                  step={1}
                  value={[offset.r]}
                  onValueChange={v => setOffset(o => ({ ...o, r: v[0] }))}
                  className="w-20 bg-gray-300 dark:bg-gray-700 rounded-full"
                />
                <span className="text-xs w-8">{offset.r}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">G</span>
                <Slider
                  min={-64}
                  max={64}
                  step={1}
                  value={[offset.g]}
                  onValueChange={v => setOffset(o => ({ ...o, g: v[0] }))}
                  className="w-20 bg-gray-300 dark:bg-gray-700 rounded-full"
                />
                <span className="text-xs w-8">{offset.g}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">B</span>
                <Slider
                  min={-64}
                  max={64}
                  step={1}
                  value={[offset.b]}
                  onValueChange={v => setOffset(o => ({ ...o, b: v[0] }))}
                  className="w-20 bg-gray-300 dark:bg-gray-700 rounded-full"
                />
                <span className="text-xs w-8">{offset.b}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-12">Angle</span>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[angle]}
                  onValueChange={v => setAngle(v[0])}
                  className="w-32 bg-gray-300 dark:bg-gray-700 rounded-full"
                />
                <span className="text-sm w-12">{angle}°</span>
              </div>
            </div>
          )}
        </div>

        {/* Gradient Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(g => {
            const a = adjusted({ ...g, angle, type });
            const css = buildGradientCss(a);
            const id = `grad-card-${g._id}`;
            return (
              <div key={g._id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div id={id} className="h-48 w-full" style={{ background: css }} />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {timeAgo(g.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCss(a)}
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      <RiCss3Fill className="w-4 h-4 mr-1" />
                      CSS
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTailwind(a)}
                      className="cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 border-cyan-200 dark:border-cyan-800"
                    >
                      <RiTailwindCssFill className="w-4 h-4 mr-1" />
                      Tailwind
                    </Button>
                    <ExportMenu onPick={(w, h) => exportImage(id, w, h)} />
                  </div>

                  {g.tags && g.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {g.tags.map(t => (
                        <span key={t} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center">
            <Button
              onClick={() => load(page + 1)}
              disabled={loading}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Loading...
                </>
              ) : (
                'Show More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportMenu({ onPick }) {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.export-menu-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className="relative export-menu-container">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(v => !v)}
        className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border-green-200 dark:border-green-800"
      >
        <Download className="w-4 h-4 mr-1" />
        Export
      </Button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-lg border bg-white dark:bg-gray-800 shadow-xl p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Orientation</span>
            <select
              className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 cursor-pointer"
              value={orientation}
              onChange={e => setOrientation(e.target.value)}
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </div>
          <div className="space-y-1">
            {options.map(o => (
              <button
                key={o.label}
                className="w-full text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded cursor-pointer transition-colors"
                onClick={() => pick(o)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
