"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { IoMenu, IoClose } from "react-icons/io5";
import { useGradientControls } from './GradientControlsContext';

export default function GradientControls() {
  const [showFilters, setShowFilters] = useState(false);
  const { 
    rgbShuffle, setRgbShuffle, 
    offset, setOffset, 
    angle, setAngle, 
    type, setType 
  } = useGradientControls();

  return (
    <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden md:block">Type</span>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="conic">Angular</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RGB Shuffle - Desktop */}
        <div className="items-center gap-2 hidden md:flex">
          <span className="text-sm font-medium">RGB Shuffle</span>
          <Select value={rgbShuffle} onValueChange={setRgbShuffle}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="rgb">RGB</SelectItem>
              <SelectItem value="rbg">RBG</SelectItem>
              <SelectItem value="grb">GRB</SelectItem>
              <SelectItem value="gbr">GBR</SelectItem>
              <SelectItem value="brg">BRG</SelectItem>
              <SelectItem value="bgr">BGR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Angle - Desktop */}
        <div className="items-center gap-2 hidden md:flex">
          <span className="text-sm font-medium w-12">Angle</span>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[angle]}
            onValueChange={v => setAngle(v[0])}
            className="w-32 bg-muted rounded-full"
          />
          <span className="text-sm w-12">{angle}°</span>
        </div>

        {/* Toggle Button for Mobile Filters */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 rounded-md bg-muted hover:bg-accent hover:text-accent-foreground"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <IoClose size={20} /> : <IoMenu size={20} />}
        </Button>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="md:hidden space-y-4">
          {/* RGB Shuffle - Mobile */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">RGB Shuffle</span>
            <Select value={rgbShuffle} onValueChange={setRgbShuffle}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="rgb">RGB</SelectItem>
                <SelectItem value="rbg">RBG</SelectItem>
                <SelectItem value="grb">GRB</SelectItem>
                <SelectItem value="gbr">GBR</SelectItem>
                <SelectItem value="brg">BRG</SelectItem>
                <SelectItem value="bgr">BGR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RGB Offset Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-8">R</span>
              <Slider
                min={-64}
                max={64}
                step={1}
                value={[offset.r]}
                onValueChange={v => setOffset(o => ({ ...o, r: v[0] }))}
                className="w-20 bg-muted rounded-full"
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
                className="w-20 bg-muted rounded-full"
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
                className="w-20 bg-muted rounded-full"
              />
              <span className="text-xs w-8">{offset.b}</span>
            </div>
          </div>

          {/* Angle - Mobile */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-12">Angle</span>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[angle]}
              onValueChange={v => setAngle(v[0])}
              className="w-32 bg-muted rounded-full"
            />
            <span className="text-sm w-12">{angle}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
