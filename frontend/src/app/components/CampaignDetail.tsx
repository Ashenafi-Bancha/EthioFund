import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, MapPin, Calendar, Share2, Link as LinkIcon, Heart, MessageCircle, Users, TrendingUp, Loader, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignDetail, useUpdateCampaign } from '../hooks/useCampaigns';
import { useCampaignComments, useAddComment } from '../hooks/useComments';
import { useCampaignDonations } from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';
import { useApproveCampaign, useRejectCampaign } from '../hooks/useAdmin';
import { apiRequest } from '../lib/api';
import { DonateModal } from './EnhancedDonateModal';
import { ShareCampaignModal } from './ShareCampaignModal';
import { CampaignUpdates } from './CampaignUpdates';
import { Milestones } from './Milestones';
import { PageBackButton } from './PageBackButton';

interface CampaignDetailProps {
  campaignId: string | null;
  onBack: () => void;
  backLabel?: string;
}

type CampaignUpdateRow = {
  update_id: number;
  campaign_id: number;
  content: string;
  posted_at: string;
};

type MilestoneRow = {
  milestone_id: number;
  campaign_id: number;
  title: string;
  description: string | null;
  target_amount: string | number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export function CampaignDetail({ campaignId, onBack, backLabel = 'Back' }: CampaignDetailProps) {
  const { user: currentUser } = useAuth();
  const { campaign, loading: campaignLoading, error: campaignError, reload: reloadCampaign } = useCampaignDetail(campaignId);
  const { comments: campaignComments, loading: commentsLoading } = useCampaignComments(campaignId);
  const { donations: recentDonations, loading: donationsLoading } = useCampaignDonations(campaignId);
  const { addComment, loading: addingComment } = useAddComment();

  const { approveCampaign, loading: approvingCampaign } = useApproveCampaign();
  const { rejectCampaign, loading: rejectingCampaign } = useRejectCampaign();
  const { updateCampaign, loading: updatingCampaign } = useUpdateCampaign();

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState<number>(campaign?.share_count ?? 0);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'comments' | 'milestones'>('story');
  const [updates, setUpdates] = useState<Array<{ id: string; campaignId: string; title: string; content: string; images: string[]; createdAt: string; createdBy: string }>>([]);
  const [milestones, setMilestones] = useState<Array<{ id: string; amount: number; description: string; reached: boolean; reachedDate?: string }>>([]);
  const updateCount = updates.length;
  const milestoneCount = milestones.length;

  const handlePostComment = async () => {
    if (newComment.trim() && campaignId) {
      const result = await addComment({
        campaign_id: campaignId,
        message: newComment,
      });
      if (result) {
        setNewComment('');
        if (result.pendingReview) {
          toast.success('Comment submitted for moderation review.');
        } else {
          toast.success('Comment posted successfully!');
        }
      } else {
        toast.error('Failed to post comment. Please try again.');
      }
    }
  };

  useEffect(() => {
    setShareCount(campaign?.share_count ?? 0);
  }, [campaign?.share_count]);

  // Load collateral resource tables (updates & milestones) in parallel.
  // Optimizes networking performance by using Promise.all to fetch both datasets concurrently.
  useEffect(() => {
    if (!campaignId) {
      setUpdates([]);
      setMilestones([]);
      return;
    }

    const loadCampaignExtras = async () => {
      try {
        const [updatesResponse, milestonesResponse] = await Promise.all([
          apiRequest<{ success?: boolean; updates?: CampaignUpdateRow[] } | CampaignUpdateRow[]>(`/campaigns/${campaignId}/updates`),
          apiRequest<{ success?: boolean; milestones?: MilestoneRow[] } | MilestoneRow[]>(`/campaigns/${campaignId}/milestones`),
        ]);

        // Normalize variations in API response shapes (raw arrays vs wrapped success payloads)
        const updateRows = Array.isArray(updatesResponse) ? updatesResponse : updatesResponse.updates ?? [];
        const milestoneRows = Array.isArray(milestonesResponse) ? milestonesResponse : milestonesResponse.milestones ?? [];

        // Map updates to component state representation
        setUpdates(updateRows.map((update) => ({
          id: String(update.update_id),
          campaignId: String(update.campaign_id),
          title: 'Campaign Update',
          content: update.content,
          images: [],
          createdAt: update.posted_at,
          createdBy: campaign?.organizer_name ?? 'Organizer',
        })));

        // Map milestones to component state representation
        setMilestones(milestoneRows.map((milestone) => ({
          id: String(milestone.milestone_id),
          amount: Number(milestone.target_amount) || 0,
          description: milestone.description || milestone.title,
          reached: Boolean(milestone.is_completed),
          reachedDate: milestone.completed_at ?? undefined,
        })));
      } catch {
        // Safe fallback resets state grids silently on query failure
        setUpdates([]);
        setMilestones([]);
      }
    };

    void loadCampaignExtras();
  }, [campaignId, campaign?.organizer_name]);

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

  const handleAdminApprove = async () => {
    if (!campaignId) return;
    const ok = await approveCampaign(campaignId);
    if (ok) {
      toast.success('Campaign approved and published successfully.');
      reloadCampaign();
    } else {
      toast.error('Failed to approve campaign.');
    }
  };

  const handleAdminReject = async () => {
    if (!campaignId) return;
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    const ok = await rejectCampaign(campaignId, reason || 'Rejected after admin review');
    if (ok) {
      toast.success('Campaign rejected successfully.');
      reloadCampaign();
    } else {
      toast.error('Failed to reject campaign.');
    }
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'closed') => {
    if (!campaignId) return;
    const ok = await updateCampaign(campaignId, { status: newStatus });
    if (ok) {
      toast.success(`Campaign successfully ${newStatus === 'active' ? 're-opened' : 'closed'}.`);
      reloadCampaign();
    } else {
      toast.error('Failed to update campaign status.');
    }
  };

  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const isOrganizer = currentUser?.id === campaign.organizer_id;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.created_at).getTime() + campaign.duration_days * 86400000 - Date.now()) / 86400000));
  const supportingDocuments = campaign.supporting_documents ?? [];
  const canReviewDocuments = currentUser?.role === 'admin' || isOrganizer;
  const shareUrl = campaign.share_url || `${window.location.origin}/campaigns/${campaign.id}`;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Campaign link copied to clipboard!');
    } catch {
      toast.error('Unable to copy link. Please try again.');
    }
  };

  const canDonate = campaign.status === 'active' && !isOrganizer;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-28 lg:pb-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <PageBackButton onBack={onBack} label={backLabel} className="mb-4" />

        {/* Administrative Approval Banner */}
        {currentUser?.role === 'admin' && campaign.status === 'pending' && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Campaign Pending Approval</h3>
              <p className="mt-1 text-sm text-orange-50">Review the supporting documents and project story below before making a decision.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleAdminApprove()}
                disabled={approvingCampaign}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Approve Campaign
              </button>
              <button
                type="button"
                onClick={() => void handleAdminReject()}
                disabled={rejectingCampaign}
                className="inline-flex items-center justify-center rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-800 transition-colors shadow-sm disabled:opacity-50"
              >
                Reject Campaign
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Image */}
            <div className="relative mb-4 h-48 overflow-hidden rounded-xl sm:mb-6 sm:h-64 lg:h-80">
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

            <div className="mb-4 rounded-xl bg-white p-4 shadow-md lg:hidden">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-xl font-bold text-gray-900">ETB {campaign.raised_amount.toLocaleString()}</span>
                <span className="text-xs text-gray-500">of {campaign.goal_amount.toLocaleString()}</span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-600 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                <div>
                  <div className="font-bold text-gray-900">{campaign.donor_count}</div>
                  <div>donors</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{daysLeft}</div>
                  <div>days left</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{shareCount}</div>
                  <div>shares</div>
                </div>
              </div>
            </div>

            {/* Campaign Title & Info */}
            <div className="mb-4 rounded-xl bg-white p-4 shadow-md sm:mb-6 sm:p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 sm:text-sm">
                      {campaign.category}
                    </span>
                  </div>
                  <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{campaign.title}</h1>
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-700 sm:text-base">{campaign.description}</p>

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                <span>by <span className="font-semibold text-gray-900">{campaign.organizer_name}</span></span>
              </div>
            </div>

            {canReviewDocuments && supportingDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Submitted documents</h2>
                    <p className="mt-1 text-sm text-gray-600">These files were submitted with the campaign and are visible to organizers and admins before approval.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {supportingDocuments.map((document) => (
                    <a
                      key={document}
                      href={document}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-green-300 hover:bg-green-50"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="flex-1 break-all text-sm font-medium text-gray-800">{document.split('/').pop() || document}</span>
                      <Download className="w-4 h-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-900">Community discussion</p>
                  <p className="mt-1 text-sm text-green-800">Comments are moderated.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  Go to comments ({campaignComments.length})
                </button>
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
                    Updates ({updateCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('milestones')}
                    className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'milestones'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Milestones ({milestoneCount})
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
                    updates={updates}
                    campaignId={campaign.id}
                    isOrganizer={isOrganizer}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'milestones' && (
                  <Milestones 
                    milestones={milestones}
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
                          className="mt-3 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
                          <p className="text-sm text-gray-600">No comments yet.</p>
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
            <div className="space-y-4 lg:sticky lg:top-24 lg:space-y-6">
              {/* Status Management Card */}
              {(isOrganizer || currentUser?.role === 'admin') && (campaign.status === 'active' || campaign.status === 'completed') && (
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-900 mb-1">Campaign Controls</h3>
                  <p className="text-xs text-gray-500 mb-4">Manage this campaign's status and public visibility.</p>
                  {campaign.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus('closed')}
                      disabled={updatingCampaign}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      Close Campaign
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus('active')}
                      disabled={updatingCampaign}
                      className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      Re-open Campaign
                    </button>
                  )}
                </div>
              )}

              {/* Donation Card */}
              <div className="hidden rounded-xl bg-white p-4 shadow-md sm:block sm:p-6 lg:block">
                <div className="mb-6">
                  <div className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
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

                {canDonate && (
                  <button
                    type="button"
                    onClick={() => setShowDonateModal(true)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 py-3 text-white shadow-md transition-all hover:from-green-600 hover:to-blue-700 sm:py-4"
                  >
                    <Heart className="h-5 w-5" />
                    Donate Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-gray-700 transition-all hover:bg-gray-200"
                >
                  <Share2 className="h-5 w-5" />
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

      {canDonate && !showDonateModal && !showShareModal && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg gap-2">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              type="button"
              onClick={() => setShowDonateModal(true)}
              className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Heart className="h-4 w-4" />
              Donate
            </button>
          </div>
        </div>
      )}

      {!canDonate && !showShareModal && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800"
          >
            <Share2 className="h-4 w-4" />
            Share campaign
          </button>
        </div>
      )}

      {showDonateModal && campaign && (
        <DonateModal campaign={campaign} onClose={() => setShowDonateModal(false)} />
      )}

      {showShareModal && campaign && (
        <ShareCampaignModal
          campaign={campaign}
          onClose={() => setShowShareModal(false)}
          onShare={() => setShareCount((c: number) => c + 1)}
        />
      )}
    </div>
  );
}