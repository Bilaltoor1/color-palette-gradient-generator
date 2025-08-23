import { Suspense } from "react";
import { GRADIENT_CATEGORIES } from '@/data/categories';
import {dbConnect} from '@/lib/mongoose';
import Gradient from '@/models/Gradient';
import HeroSection from './components/HeroSection';
import CategoryFilter from './components/CategoryFilter';
import GradientControls from './components/GradientControls';
import GradientGrid from './components/GradientGrid';
import { GradientControlsProvider } from './components/GradientControlsContext';

// Server-side data fetching
async function getGradients(searchParams) {
  await dbConnect();
  
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const sort = params.sort || 'newest';
  const category = params.category || 'all';
  
  const skip = (page - 1) * limit;
  
  let query = {};
  if (category && category !== 'all') {
    query.categories = { $in: [category] };
  }
  
  const sortOrder = sort === 'newest' ? { createdAt: -1 } : { createdAt: 1 };
  
  try {
    const [items, total] = await Promise.all([
      Gradient.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Gradient.countDocuments(query)
    ]);
    
    const hasMore = skip + items.length < total;
    
    return {
      items: JSON.parse(JSON.stringify(items)),
      hasMore,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching gradients:', error);
    return {
      items: [],
      hasMore: false,
      total: 0,
      currentPage: 1,
      totalPages: 0
    };
  }
}

export default async function ExploreGradientsPage({ searchParams }) {
  const { items, hasMore, total, currentPage, totalPages } = await getGradients(searchParams);
  const params = await searchParams;
  const selectedCategory = params.category || 'all';
  const currentSort = params.sort || 'newest';

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          categories={GRADIENT_CATEGORIES}
          currentSort={currentSort}
        />

        <GradientControlsProvider>
          <Suspense fallback={<div>Loading controls...</div>}>
            <GradientControls />
          </Suspense>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold text-foreground">No gradients found for this category</h3>
              <p className="text-sm text-muted-foreground mt-2">Try selecting a different category or clear the filter.</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading gradients...</div>}>
              <GradientGrid 
                initialItems={items}
                hasMore={hasMore}
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                categories={GRADIENT_CATEGORIES}
                selectedCategory={selectedCategory}
                currentSort={currentSort}
              />
            </Suspense>
          )}
        </GradientControlsProvider>
      </div>
    </div>
  );
}

// Enable ISR with 60 second revalidation
export const revalidate = 60;