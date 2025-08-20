"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ColorWheel from "../components/ColorWheel";
import PalettePreview from "../components/PalettePreview";
import { generatePalette, hsvToHex, hsvToRgb, hsvToHsl } from "../components/PaletteUtils";
import { ArrowLeft } from "lucide-react";

const SCHEMES = [
	{ id: "complementary", label: "Complementary" },
	{ id: "monochromatic", label: "Monochromatic" },
	{ id: "analogous", label: "Analogous" },
	{ id: "triadic", label: "Triadic" },
	{ id: "tetradic", label: "Tetradic" },
];

export default function PalettePage() {
	const router = useRouter();
	const [scheme, setScheme] = useState("complementary");
	const [hsv, setHsv] = useState({ h: 210, s: 0.9, v: 0.9 });
	const [paletteSize, setPaletteSize] = useState(5);
	const exportRef = useRef(null);

	const palette = useMemo(() => generatePalette(hsv, scheme, paletteSize), [hsv, scheme, paletteSize]);

	// selectors reflect each palette slot; allow selecting which one to edit
	const [selectors, setSelectors] = useState(() => palette.map((p) => ({ hsv: p.hsv })));
	const [activeIndex, setActiveIndex] = useState(0);

	// sync selectors when paletteSize or palette changes
	useEffect(() => {
		setSelectors((prev) => {
			const next = palette.map((p, i) => ({ hsv: p.hsv }));
			for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i].hsv = prev[i].hsv || next[i].hsv;
			return next;
		});
		if (activeIndex >= palette.length) setActiveIndex(0);
	}, [paletteSize, palette]);

	const handleSelect = (idx) => setActiveIndex(idx);
	const handleSelectorMove = (idx, newHsv) => {
		setSelectors((s) => {
			const copy = s.slice();
			copy[idx] = { hsv: newHsv };
			return copy;
		});
		if (idx === 0) setHsv(newHsv);
	};

	const heroHex = useMemo(() => hsvToHex(hsv), [hsv]);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Hero */}
			<section
				className="w-full"
				style={{
					background: `linear-gradient(135deg, ${heroHex} 0%, ${hsvToHex({ ...hsv, v: Math.min(1, hsv.v * 0.6) })} 100%)`,
				}}
			>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">
						Color Palette Studio
					</h1>
					<p className="mt-3 text-white/90 max-w-2xl">
						Build palettes like Canva: complementary, monochromatic, analogous, triadic, and tetradic.
					</p>
				</div>
			</section>

			{/* Tool */}
			<main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
						<div className="flex items-center justify-between gap-3 flex-wrap">
							<label className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Scheme</label>
							<div className="flex gap-2 flex-wrap">
								{SCHEMES.map((s) => (
									<button
										key={s.id}
										className={`xs:text-sm text-xs px-3 py-1.5 rounded-full border transition-colors ${
											scheme === s.id
												? "bg-foreground text-background border-transparent"
												: "border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
										}`}
										onClick={() => setScheme(s.id)}
									>
										{s.label}
									</button>
								))}
							</div>
						</div>

						<div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-start">
							<ColorWheel
								size={260}
								hsv={hsv}
								onChange={(newHsv) => {
									if (activeIndex === 0) setHsv(newHsv);
								}}
								selectors={selectors}
								activeIndex={activeIndex}
								onSelect={handleSelect}
								onSelectorMove={handleSelectorMove}
								className="mx-auto"
							/>

							<div className="flex flex-col gap-4">
								<div>
									<p className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Base color</p>
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-md border border-black/10 dark:border-white/15"
											style={{ backgroundColor: heroHex }}
										/>
										<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
											<span className="text-foreground/70">HEX</span>
											<span className="font-mono">{heroHex}</span>
											<span className="text-foreground/70">RGB</span>
											<span className="font-mono">
												{(() => {
													const { r, g, b } = hsvToRgb(hsv);
													return `${r}, ${g}, ${b}`;
												})()}
											</span>
											<span className="text-foreground/70">HSL</span>
											<span className="font-mono">
												{(() => {
													const { h, s, l } = hsvToHsl(hsv);
													return `${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
												})()}
											</span>
										</div>
									</div>
								</div>

								<label className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Palette size</label>
								<div className="flex items-center gap-3">
									<input
										type="range"
										min={2}
										max={8}
										value={paletteSize}
										onChange={(e) => setPaletteSize(parseInt(e.target.value))}
										className="w-full"
									/>
									<span className="text-sm tabular-nums w-6 text-right">{paletteSize}</span>
								</div>

								<div className="flex gap-2">
									<button
										className="px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
										onClick={() => setHsv((prev) => ({ ...prev, s: 0.9, v: 0.9 }))}
										title="Reset value"
									>
										Reset
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-4 sm:p-6 border border-black/5 dark:border-white/10">
						<div className="flex items-center justify-between gap-3 flex-wrap mb-4">
							<h2 className="text-lg font-semibold">Palette preview</h2>
							<PalettePreview exportRef={exportRef} palette={palette} />
						</div>

						{/* PalettePreview renders the grid and copy controls */}
					</div>
				</div>

				<div className="mt-10 text-center text-xs text-foreground/60">
					Tip: drag on the wheel to pick hue/saturation. Value (brightness) is fixed to keep colors vivid.
				</div>
			</main>
		</div>
	);
}
