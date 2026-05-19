import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, MapPin, Calendar, Share2, Heart, MessageCircle, Users, TrendingUp, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignDetail } from '../hooks/useCampaigns';
import { useCampaignComments, useAddComment } from '../hooks/useComments';
import { useCampaignDonations } from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';
import { EnhancedDonateModal } from './EnhancedDonateModal';
import { ShareCampaignModal } from './ShareCampaignModal';
import { CampaignUpdates } from './CampaignUpdates';
import { Milestones } from './Milestones';

interface CampaignDetailProps {
  campaignId: string | null;
  onBack: () => void;
}

export function CampaignDetail({ campaignId, onBack }: CampaignDetailProps) {
  const { user: currentUser } = useAuth();
  const { campaign, loading: campaignLoading, error: campaignError } = useCampaignDetail(campaignId);
  const { comments: campaignComments, loading: commentsLoading } = useCampaignComments(campaignId);
  const { donations: recentDonations, loading: donationsLoading } = useCampaignDonations(campaignId);
  const { addComment, loading: addingComment } = useAddComment();

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState<number>(campaign?.share_count ?? 0);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'comments' | 'milestones'>('story');

  const handlePostComment = async () => {
    if (newComment.trim() && campaignId) {
      const result = await addComment({
        campaign_id: campaignId,
        message: newComment,
      });
      if (result) {
        setNewComment('');
        toast.success('Comment posted successfully!');
      } else {
        toast.error('Failed to post comment. Please try again.');
      }
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="w-5 h-5 animate-spin" />
          Loading campaign...
        </div>
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Campaign not found</h2>
          <button onClick={onBack} className="mt-4 text-green-600 hover:text-green-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const isOrganizer = currentUser?.id === campaign.organizer_id;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.created_at).getTime() + campaign.duration_days * 86400000 - Date.now()) / 86400000));

  useEffect(() => {
    setShareCount(campaign?.share_count ?? 0);
  }, [campaign?.share_count]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Image */}
            <div className="relative h-96 rounded-xl overflow-hidden mb-6">
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              {campaign.verified && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verified Campaign
                </div>
              )}
            </div>

            {/* Campaign Title & Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {campaign.category}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Started {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <p className="text-lg text-gray-700 mb-4">{campaign.description}</p>

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                <span>by <span className="font-semibold text-gray-900">{campaign.organizer_name}</span></span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('story')}
                    className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'story'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Story
                  </button>
                  <button
                    onClick={() => setActiveTab('updates')}
                    className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'updates'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Updates ({campaign.updates?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('milestones')}
                    className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'milestones'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Milestones ({campaign.milestones?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'comments'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Comments ({campaignComments.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'story' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{campaign.story}</p>
                  </div>
                )}

                {activeTab === 'updates' && (
                  <CampaignUpdates 
                    updates={[]} 
                    campaignId={campaign.id}
                    isOrganizer={isOrganizer}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'milestones' && (
                  <Milestones 
                    milestones={[]} 
                    currentAmount={campaign.raised_amount}
                  />
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    {/* Comment Form */}
                    {currentUser ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          rows={3}
                          disabled={addingComment}
                        />
                        <button
                          onClick={handlePostComment}
                          disabled={addingComment || !newComment.trim()}
                          className="mt-3 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50"
                        >
                          {addingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600">Please log in to leave a comment</p>
                      </div>
                    )}

                    {/* Comments List */}
                    {commentsLoading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading comments...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {campaignComments.length > 0 ? (
                          campaignComments.map((comment) => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {comment.user_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{comment.user_name}</span>
                                    <span className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-700">{comment.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Donation Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ETB {campaign.raised_amount.toLocaleString()}
                  </div>
                  <div className="text-gray-600 mb-4">
                    raised of ETB {campaign.goal_amount.toLocaleString()} goal
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{campaign.donor_count}</div>
                      <div className="text-sm text-gray-600">donors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
                      <div className="text-sm text-gray-600">days left</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{shareCount}</div>
                      <div className="text-sm text-gray-600">shares</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDonateModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all shadow-md mb-3 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Donate Now
                </button>

                <button 
                  onClick={() => setShowShareModal(true)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Campaign
                </button>
              </div>

              {/* Recent Donations */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Donations
                </h3>
                {donationsLoading ? (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading donations...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.length > 0 ? (
                      recentDonations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              {donation.anonymous ? 'Anonymous' : donation.donor_name}
                            </span>
                            <span className="font-semibold text-green-600">
                              ETB {donation.amount.toLocaleString()}
                            </span>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-gray-600 italic">{donation.message}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{new Date(donation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">Be the first to donate!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {campaign.organizer_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{campaign.organizer_name}</div>
                    <div className="text-sm text-gray-600">{campaign.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDonateModal && campaign && (
        <EnhancedDonateModal
          campaign={campaign as any}
          onClose={() => setShowDonateModal(false)}
        />
      )}

      {showShareModal && campaign && (
        <ShareCampaignModal
          campaign={campaign as any}
          onClose={() => setShowShareModal(false)}
          onShare={() => setShareCount((c) => c + 1)}
        />
      )}
    </div>
  );
}