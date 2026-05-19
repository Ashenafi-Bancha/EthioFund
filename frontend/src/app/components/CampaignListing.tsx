import { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, MapPin, TrendingUp, Flame, Loader } from 'lucide-react';
import { useCampaigns, CampaignResponse } from '../hooks/useCampaigns';

interface CampaignListingProps {
  onViewCampaign: (campaignId: string) => void;
}

export function CampaignListing({ onViewCampaign }: CampaignListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const { campaigns, loading, error } = useCampaigns({ status: 'active' });

  const categories = [
    { value: 'All', label: 'All' },
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'funeral', label: 'Funeral' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'community', label: 'Community' },
  ];
  const locations = ['All', 'Addis Ababa', 'Oromia Region', 'Amhara Region', 'SNNPR', 'Tigray Region', 'Dire Dawa', 'Gambela Region'];

  // Calculate days left and format campaigns
  const formattedCampaigns = useMemo(() => {
    return campaigns.map(campaign => ({
      ...campaign,
      daysLeft: Math.max(0, Math.ceil((new Date(campaign.created_at).getTime() + campaign.duration_days * 86400000 - Date.now()) / 86400000)),
    }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return formattedCampaigns
      .filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            campaign.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
        const matchesLocation = selectedLocation === 'All' || campaign.location === selectedLocation;
        return matchesSearch && matchesCategory && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'popular') return b.donor_count - a.donor_count;
        if (sortBy === 'ending') return a.daysLeft - b.daysLeft;
        return 0;
      });
  }, [formattedCampaigns, searchQuery, selectedCategory, selectedLocation, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Campaigns</h1>
          <p className="text-lg text-gray-600">Discover verified campaigns making a difference in Ethiopia</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="featured">Featured</option>
                <option value="ending">Ending Soon</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader className="w-4 h-4 animate-spin" />
              Loading campaigns...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600">
              <span>Error loading campaigns: {error}</span>
            </div>
          ) : (
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredCampaigns.length}</span> campaign{filteredCampaigns.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Campaign Grid */}
        {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
            return (
              <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      {campaign.verified && (
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 font-semibold">{campaign.category}</span>
                    {campaign.daysLeft <= 7 && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        {campaign.daysLeft} days left
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{campaign.location}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-900">ETB {campaign.raised_amount.toLocaleString()}</span>
                      <span className="text-gray-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Goal: ETB {campaign.goal_amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{campaign.donor_count} donors</span>
                    <span>{campaign.daysLeft} days left</span>
                  </div>

                  <button
                    onClick={() => onViewCampaign(campaign.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                  >
                    View Campaign
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {!loading && filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All');
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}