"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function CategoryFilter({ selectedCategory, categories, currentSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    
    // Reset to page 1 when changing category
    params.delete('page');
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(`/gradient/explore${newUrl}`);
    router.refresh();
  };

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.delete('page'); // Reset to page 1 when changing sort
    
    const queryString = params.toString();
    router.push(`/gradient/explore?${queryString}`);
    router.refresh();
  };

  return (
    <section className="bg-muted/50 border border-border rounded-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent text-foreground"
              }`}
            >
              All
            </button>
            {categories.slice(0, 7).map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "bg-background hover:bg-accent text-foreground"
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort</span>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
