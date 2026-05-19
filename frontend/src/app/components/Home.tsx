import { ArrowRight, Heart, Shield, TrendingUp, Users, CheckCircle, Search, Globe, Zap, Loader } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';

interface HomeProps {
  onNavigate: (page: string) => void;
  onViewCampaign: (campaignId: string) => void;
}

export function Home({ onNavigate, onViewCampaign }: HomeProps) {
  const { campaigns, loading: campaignsLoading } = useCampaigns({ status: 'active' });

  // Get first 3 active campaigns as featured
  const featuredCampaigns = campaigns.slice(0, 3);

  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised_amount, 0);
  const activeCount = campaigns.length;

  const statsList = [
    { label: 'Total Raised', value: `ETB ${totalRaised.toLocaleString()}`, icon: TrendingUp },
    { label: 'Active Campaigns', value: activeCount.toString(), icon: Heart },
    { label: 'Communities Reached', value: 'Ethiopia + diaspora', icon: Users },
    { label: 'Verified', value: '100%', icon: CheckCircle }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Campaigns',
      description: 'All campaigns are thoroughly verified by our team to ensure transparency and trust.'
    },
    {
      icon: Heart,
      title: 'Secure Donations',
      description: 'Donate using Chapa, with secure checkout designed for Ethiopia and the diaspora.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join thousands of Ethiopians and diaspora members making a real difference.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Supporters in Ethiopia and across the diaspora can give through the same streamlined experience.'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Keep donors engaged with campaign updates, milestones, and progress tracking.'
    },
    {
      icon: TrendingUp,
      title: 'Trending Campaigns',
      description: 'Discover the most supported campaigns and join the movement.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-white py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                Empowering Ethiopia,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  One Campaign at a Time
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
                Join the movement of Ethiopians supporting their communities through transparent, verified crowdfunding campaigns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('campaigns')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Browse Campaigns
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                >
                  Start a Campaign
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1697665387559-253e7a645e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kcyUyMHRvZ2V0aGVyJTIwZG9uYXRpb24lMjBtb25leSUyMHN1cHBvcnR8ZW58MXx8fHwxNzY5NDYxMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Community Support"
                className="rounded-2xl shadow-2xl w-full h-64 md:h-96 lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {statsList.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <stat.icon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Campaigns</h2>
            <p className="text-lg text-gray-600">Make a difference today by supporting verified campaigns</p>
          </div>
          
          {campaignsLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-600 py-12">
              Loading campaigns...
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {featuredCampaigns.map((campaign) => {
                  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
                  // Calculate days left
                  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.created_at).getTime() + campaign.duration_days * 86400000 - Date.now()) / 86400000));
                  
                  return (
                    <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                        {campaign.verified && (
                          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-green-600 mb-2">{campaign.category}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-900">ETB {campaign.raised_amount.toLocaleString()}</span>
                            <span className="text-gray-600">of ETB {campaign.goal_amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>{campaign.donor_count} donors</span>
                          <span>{daysLeft} days left</span>
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
              <div className="text-center">
                <button
                  onClick={() => onNavigate('campaigns')}
                  className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all inline-flex items-center gap-2"
                >
                  View All Campaigns
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>No active campaigns at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EthioFund?</h2>
            <p className="text-lg text-gray-600">Trusted, transparent, and built for Ethiopia</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-white/90 mb-8">
            Start your campaign today or support a cause that matters to you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('auth')}
              className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-all"
            >
              Start a Campaign
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all"
            >
              Browse Campaigns
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}