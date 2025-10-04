import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid2x2 as Grid, List, Music, TrendingUp, Star, Users, Play, Heart, ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import ActiveListingCard from '@/components/marketplace/ActiveListingCard';
import CreatorCard from '@/components/profile/CreatorCard';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

import { useActiveListings } from '@/hooks/useActiveListings';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useProfile } from '@/hooks/useProfile';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useMusicPlayerContext } from '@/hooks/useMusicPlayerContext';

import banner from '@/images/banner.png';
import footerBg from '@/images/assets/footer.png';

const CATEGORIES = ['All', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Reggae', 'Folk'];
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

type ViewMode = 'grid' | 'list';
type SortType = 'recent' | 'price-low' | 'price-high' | 'popular' | 'alphabetical';
type TabType = 'all' | 'trending' | 'new' | 'featured';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { address } = useAccount();
  const { playSong } = useMusicPlayerContext();

  // States
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Data hooks
  const { allActiveListings, isLoading: isLoadingListings, totalListings } = useActiveListings();
  const {
    trendingTracks,
    newReleases,
    featuredTracks,
    platformMetrics,
    isLoadingTrending,
    isLoadingNewReleases,
    isLoadingFeatured,
  } = useDiscovery();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL with search params
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [searchQuery]);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sort function
  const sortTracks = useCallback((tracks: any[], sortType: SortType) => {
    const sorted = [...tracks];

    switch (sortType) {
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.priceInETH || '0') - parseFloat(b.priceInETH || '0'));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.priceInETH || '0') - parseFloat(a.priceInETH || '0'));
      case 'alphabetical':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'popular':
        return sorted.sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0));
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    }
  }, []);

  // Get filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    let tracks = allActiveListings;

    // Filter by category
    if (selectedCategory !== 'All') {
      tracks = tracks.filter(track => {
        const genre = Array.isArray(track.genre) ? track.genre.join(' ') : (track.genre || '');
        return genre.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      tracks = tracks.filter(track => {
        const title = (track.title || '').toLowerCase();
        const genre = Array.isArray(track.genre) ? track.genre.join(' ').toLowerCase() : (track.genre || '').toLowerCase();
        const seller = (track.seller || '').toLowerCase();

        return title.includes(query) || genre.includes(query) || seller.includes(query);
      });
    }

    // Sort tracks
    return sortTracks(tracks, sortBy);
  }, [allActiveListings, selectedCategory, debouncedSearch, sortBy, sortTracks]);

  // Statistics
  const stats = useMemo(() => ({
    totalTracks: filteredTracks.length,
    totalListings: totalListings,
    totalCreators: new Set(filteredTracks.map(t => t.seller)).size,
    totalPlays: filteredTracks.reduce((sum, t) => sum + (t.totalPlays || 0), 0),
  }), [filteredTracks, totalListings]);

  if (isInitialLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Hero Banner */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
        <ImageWithFallback
          src={banner}
          alt="Explore Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent mb-2 md:mb-4">
            Explore Music NFTs
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl">
            Discover, collect, and trade unique music created by talented artists on HiBeats
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-primary/20 rounded-lg">
                  <Music className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Tracks</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalTracks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Creators</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalCreators}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Plays</p>
                  <p className="text-lg md:text-2xl font-bold">{(stats.totalPlays / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <Input
                placeholder="Search tracks, creators, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Buttons */}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'All' || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Genre: {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="ml-1 hover:text-primary">
                      ×
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-primary">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="text-xs md:text-sm py-2 md:py-3">
              All Tracks
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs md:text-sm py-2 md:py-3">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs md:text-sm py-2 md:py-3">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              New
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-xs md:text-sm py-2 md:py-3">
              <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {/* Results */}
            {filteredTracks.length > 0 ? (
              <div className={cn(
                "grid gap-4 md:gap-6",
                viewMode === 'grid'
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}>
                {filteredTracks.map((track) => (
                  <ActiveListingCard
                    key={track.id}
                    listing={track}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-8 md:p-12 text-center">
                  <Music className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2">No tracks found</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Trending tracks coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">New releases coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Featured tracks coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="relative py-12 md:py-16 px-4 text-center">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Start Your Music Journey
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto">
              Join thousands of music lovers discovering and collecting unique tracks on HiBeats
            </p>
            <Button size="lg" onClick={() => navigate('/create')} className="text-sm md:text-base">
              Create Your First Track
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
