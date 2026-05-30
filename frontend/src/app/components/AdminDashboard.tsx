import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Users, FileText, Loader } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminStats,
  usePendingCampaigns,
  usePendingWithdrawals,
  useApproveCampaign,
  useRejectCampaign,
  usePendingComments,
  useReviewComment,
} from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onViewCampaign: (campaignId: string) => void;
}

export function AdminDashboard({ onViewCampaign }: AdminDashboardProps) {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useAdminStats();
  const { campaigns: pendingCampaigns, loading: campaignsLoading } = usePendingCampaigns();
  const { withdrawals: pendingWithdrawals, loading: withdrawalsLoading } = usePendingWithdrawals();
  const { comments: pendingComments, loading: commentsLoading } = usePendingComments();
  const { approveCampaign, loading: approvingCampaign } = useApproveCampaign();
  const { rejectCampaign, loading: rejectingCampaign } = useRejectCampaign();
  const { reviewComment, loading: reviewingComment } = useReviewComment();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'withdrawals' | 'comments'>('overview');

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleApprove = async (campaignId: string) => {
    const ok = await approveCampaign(campaignId);
    if (ok) {
      toast.success('Campaign approved and published.');
    } else {
      toast.error('Failed to approve campaign.');
    }
  };

  const handleReject = async (campaignId: string) => {
    const ok = await rejectCampaign(campaignId, 'Rejected after admin review');
    if (ok) {
      toast.success('Campaign rejected.');
    } else {
      toast.error('Failed to reject campaign.');
    }
  };

  const handleCommentReview = async (commentId: string, decision: 'approved' | 'rejected') => {
    const ok = await reviewComment(commentId, decision);
    if (ok) {
      toast.success(decision === 'approved' ? 'Comment approved.' : 'Comment rejected.');
    } else {
      toast.error('Failed to update comment moderation decision.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">Admin control center</p>
          <h1 className="text-3xl font-bold text-gray-900">Platform oversight</h1>
          <p className="mt-2 text-lg text-gray-600">Review campaigns, manage withdrawals, and monitor platform activity.</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-4">
          {statsLoading ? (
            <div className="md:col-span-4 flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-12 text-gray-600 shadow-md">
              <Loader className="h-5 w-5 animate-spin" />
              Loading platform statistics...
            </div>
          ) : (
            [
              { label: 'Users', value: stats?.users ?? 0, icon: Users },
              { label: 'Campaigns', value: stats?.campaigns ?? 0, icon: FileText },
              { label: 'Successful donations', value: stats?.donations ?? 0, icon: CheckCircle },
              { label: 'Withdrawals', value: stats?.withdrawals ?? 0, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <stat.icon className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))
          )}
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'campaigns' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Campaign approvals
                {pendingCampaigns.length > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{pendingCampaigns.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('withdrawals')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'withdrawals' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Withdrawal requests
                {pendingWithdrawals.length > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{pendingWithdrawals.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'comments' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Comment moderation
                {pendingComments.length > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{pendingComments.length}</span>}
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-green-50 p-5">
                  <div className="text-sm text-green-700">Users</div>
                  <div className="mt-1 text-3xl font-bold text-green-900">{stats?.users ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="text-sm text-blue-700">Campaigns</div>
                  <div className="mt-1 text-3xl font-bold text-blue-900">{stats?.campaigns ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-purple-50 p-5">
                  <div className="text-sm text-purple-700">Successful donations</div>
                  <div className="mt-1 text-3xl font-bold text-purple-900">{stats?.donations ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-orange-50 p-5">
                  <div className="text-sm text-orange-700">Withdrawals</div>
                  <div className="mt-1 text-3xl font-bold text-orange-900">{stats?.withdrawals ?? 0}</div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pending campaigns</h2>
                  {campaignsLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading campaigns...
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Organizer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Goal</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingCampaigns.length > 0 ? (
                        pendingCampaigns.map((campaign) => (
                          <tr key={campaign.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{campaign.title}</div>
                              <div className="line-clamp-1 text-sm text-gray-500">{campaign.description}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{campaign.organizer_name}</td>
                            <td className="px-6 py-4 text-gray-700">{campaign.category}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">ETB {campaign.goal_amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-700">{new Date(campaign.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button type="button" onClick={() => onViewCampaign(campaign.id)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50" title="View details">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => void handleApprove(campaign.id)} disabled={approvingCampaign} className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50" title="Approve">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => void handleReject(campaign.id)} disabled={rejectingCampaign} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50" title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No pending campaigns right now.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pending withdrawals</h2>
                  {withdrawalsLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading withdrawals...
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Organizer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Bank Account</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingWithdrawals.length > 0 ? (
                        pendingWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{withdrawal.campaign_title}</td>
                            <td className="px-6 py-4 text-gray-700">{withdrawal.organizer_name}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">ETB {withdrawal.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{withdrawal.bank_account}</td>
                            <td className="px-6 py-4 text-gray-700">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No pending withdrawals.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pending comment reviews</h2>
                  {commentsLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading comments...
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingComments.length > 0 ? (
                        pendingComments.map((comment) => (
                          <tr key={comment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{comment.campaign_title}</td>
                            <td className="px-6 py-4 text-gray-700">{comment.user_name}</td>
                            <td className="px-6 py-4 text-gray-700">
                              <p className="max-w-md whitespace-pre-wrap break-words">{comment.message}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{comment.moderation_reason}</td>
                            <td className="px-6 py-4 text-gray-700">{new Date(comment.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleCommentReview(comment.id, 'approved')}
                                  disabled={reviewingComment}
                                  className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCommentReview(comment.id, 'rejected')}
                                  disabled={reviewingComment}
                                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No pending comments for review.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
