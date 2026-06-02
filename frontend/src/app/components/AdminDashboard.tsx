import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Users, FileText, Loader, Mail, Archive } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminStats,
  useAdminAnalyticsOverview,
  useDonationsByMonth,
  useCampaignStatusAnalytics,
  useCommentModerationAnalytics,
  usePendingCampaigns,
  usePendingWithdrawals,
  useApproveCampaign,
  useRejectCampaign,
  usePendingComments,
  useReviewComment,
  useAdminComments,
  useAdminActivityLogs,
  useUpdateWithdrawalStatus,
  useContactMessages,
  useUpdateContactMessageStatus,
} from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  onViewCampaign: (campaignId: string) => void;
}

export function AdminDashboard({ onViewCampaign }: AdminDashboardProps) {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useAdminStats();
  const { overview: analyticsOverview, loading: overviewLoading } = useAdminAnalyticsOverview();
  const { rows: donationTrendRows, loading: donationTrendLoading } = useDonationsByMonth();
  const { rows: campaignStatusRows, loading: campaignStatusLoading } = useCampaignStatusAnalytics();
  const { rows: commentModerationRows, loading: commentModerationLoading } = useCommentModerationAnalytics();
  const { campaigns: pendingCampaigns, loading: campaignsLoading, reload: reloadCampaigns } = usePendingCampaigns();
  const { withdrawals: pendingWithdrawals, loading: withdrawalsLoading, reload: reloadWithdrawals } = usePendingWithdrawals();
  const { comments: pendingComments, loading: commentsLoading, reload: reloadPendingComments } = usePendingComments();
  const { approveCampaign, loading: approvingCampaign } = useApproveCampaign();
  const { rejectCampaign, loading: rejectingCampaign } = useRejectCampaign();
  const { reviewComment, loading: reviewingComment } = useReviewComment();
  const { comments: allComments, loading: allCommentsLoading, reload: reloadAllComments } = useAdminComments();
  const { logs: activityLogs, loading: logsLoading, reload: reloadActivityLogs } = useAdminActivityLogs();
  const { updateWithdrawalStatus, loading: updatingWithdrawalStatus } = useUpdateWithdrawalStatus();
  const { messages: contactMessages, loading: contactMessagesLoading, reload: reloadContactMessages } = useContactMessages();
  const { updateContactMessageStatus, loading: updatingContactMessage } = useUpdateContactMessageStatus();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'withdrawals' | 'support' | 'comments' | 'activity'>('overview');
  const [contactFilter, setContactFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [overrideDecision, setOverrideDecision] = useState<'approved' | 'rejected'>('approved');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    if (!selectedCommentId && allComments.length > 0) {
      setSelectedCommentId(allComments[0].id);
      setOverrideDecision(allComments[0].moderation_status === 'rejected' ? 'approved' : allComments[0].moderation_status);
      setOverrideReason(allComments[0].moderation_reason === 'No reason recorded' ? '' : allComments[0].moderation_reason);
    }
  }, [allComments, selectedCommentId]);

  const selectedComment = allComments.find((comment) => comment.id === selectedCommentId) ?? null;
  const newContactCount = contactMessages.filter((message) => message.status === 'new').length;
  const filteredContactMessages =
    contactFilter === 'all' ? contactMessages : contactMessages.filter((message) => message.status === contactFilter);

  const handleContactStatusUpdate = async (messageId: string, status: 'new' | 'read' | 'archived') => {
    const ok = await updateContactMessageStatus(messageId, status);
    if (ok) {
      toast.success(`Message marked as ${status}.`);
      reloadContactMessages();
    } else {
      toast.error('Failed to update message status.');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const cardButtonClass =
    'rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-left';

  const chartCardClass = 'rounded-2xl bg-white p-6 shadow-md';
  const pieColors = ['#16a34a', '#f97316', '#ef4444', '#3b82f6', '#a855f7', '#64748b'];

  const handleApprove = async (campaignId: string) => {
    const ok = await approveCampaign(campaignId);
    if (ok) {
      toast.success('Campaign approved and published.');
      reloadCampaigns();
    } else {
      toast.error('Failed to approve campaign.');
    }
  };

  const handleReject = async (campaignId: string) => {
    const ok = await rejectCampaign(campaignId, 'Rejected after admin review');
    if (ok) {
      toast.success('Campaign rejected.');
      reloadCampaigns();
    } else {
      toast.error('Failed to reject campaign.');
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    const ok = await updateWithdrawalStatus(withdrawalId, status);
    if (ok) {
      toast.success(`Withdrawal request ${status}.`);
      reloadWithdrawals();
      reloadActivityLogs();
    } else {
      toast.error(`Failed to ${status} withdrawal request.`);
    }
  };

  const handleSelectComment = (commentId: string) => {
    const comment = allComments.find((item) => item.id === commentId);
    if (!comment) {
      return;
    }

    setSelectedCommentId(comment.id);
    setOverrideDecision(comment.moderation_status === 'pending_review' ? 'approved' : comment.moderation_status);
    setOverrideReason(comment.moderation_reason === 'No reason recorded' ? '' : comment.moderation_reason);
    setActiveTab('comments');
  };

  const handleCommentReview = async () => {
    if (!selectedComment) {
      toast.error('Select a comment first.');
      return;
    }

    const ok = await reviewComment(selectedComment.id, overrideDecision, overrideReason.trim() || undefined);
    if (ok) {
      toast.success(overrideDecision === 'approved' ? 'Comment approved.' : 'Comment rejected.');
      reloadAllComments();
      reloadPendingComments();
      reloadActivityLogs();
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
              <button
                key={stat.label}
                type="button"
                className={cardButtonClass}
                onClick={() => {
                  if (stat.label === 'Users') setActiveTab('overview');
                  if (stat.label === 'Campaigns') setActiveTab('campaigns');
                  if (stat.label === 'Successful donations') setActiveTab('overview');
                  if (stat.label === 'Withdrawals') setActiveTab('withdrawals');
                }}
                aria-label={`Open ${stat.label}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <stat.icon className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </button>
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
                onClick={() => setActiveTab('support')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'support' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Support inbox
                {newContactCount > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{newContactCount}</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'comments' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Comment overrides
                {pendingComments.length > 0 && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{pendingComments.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === 'activity' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Activity log
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <button type="button" onClick={() => setActiveTab('overview')} className="rounded-2xl bg-green-50 p-5 text-left transition hover:shadow-sm">
                    <div className="text-sm text-green-700">Total users</div>
                    <div className="mt-1 text-3xl font-bold text-green-900">{analyticsOverview?.totalUsers ?? stats?.users ?? 0}</div>
                  </button>
                  <button type="button" onClick={() => setActiveTab('campaigns')} className="rounded-2xl bg-blue-50 p-5 text-left transition hover:shadow-sm">
                    <div className="text-sm text-blue-700">Total campaigns</div>
                    <div className="mt-1 text-3xl font-bold text-blue-900">{analyticsOverview?.totalCampaigns ?? stats?.campaigns ?? 0}</div>
                  </button>
                  <button type="button" onClick={() => setActiveTab('overview')} className="rounded-2xl bg-purple-50 p-5 text-left transition hover:shadow-sm">
                    <div className="text-sm text-purple-700">Successful donations</div>
                    <div className="mt-1 text-3xl font-bold text-purple-900">{analyticsOverview?.totalDonations ?? stats?.donations ?? 0}</div>
                  </button>
                  <button type="button" onClick={() => setActiveTab('comments')} className="rounded-2xl bg-orange-50 p-5 text-left transition hover:shadow-sm">
                    <div className="text-sm text-orange-700">Total comments</div>
                    <div className="mt-1 text-3xl font-bold text-orange-900">{analyticsOverview?.totalComments ?? 0}</div>
                    <div className="mt-2 text-xs text-orange-700/90">Pending review: {analyticsOverview?.pendingComments ?? pendingComments.length}</div>
                  </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className={chartCardClass}>
                    <div className="mb-1 text-lg font-semibold text-gray-900">Donation Trends</div>
                    <div className="text-sm text-gray-600">Successful donations (last months)</div>
                    <div className="mt-4 h-64">
                      {donationTrendLoading ? (
                        <div className="flex h-full items-center justify-center gap-2 text-gray-500">
                          <Loader className="h-4 w-4 animate-spin" />
                          Loading chart...
                        </div>
                      ) : donationTrendRows.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">No donation data yet.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={donationTrendRows}>
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="totalAmount" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className={chartCardClass}>
                      <div className="mb-1 text-lg font-semibold text-gray-900">Campaign Status</div>
                      <div className="text-sm text-gray-600">Distribution</div>
                      <div className="mt-4 h-64">
                        {campaignStatusLoading ? (
                          <div className="flex h-full items-center justify-center gap-2 text-gray-500">
                            <Loader className="h-4 w-4 animate-spin" />
                            Loading chart...
                          </div>
                        ) : campaignStatusRows.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-sm text-gray-500">No campaign data.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={campaignStatusRows} dataKey="count" nameKey="status" outerRadius={80}>
                                {campaignStatusRows.map((_, index) => (
                                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div className={chartCardClass}>
                      <div className="mb-1 text-lg font-semibold text-gray-900">Comment Moderation</div>
                      <div className="text-sm text-gray-600">Gemini workflow</div>
                      <div className="mt-4 h-64">
                        {commentModerationLoading ? (
                          <div className="flex h-full items-center justify-center gap-2 text-gray-500">
                            <Loader className="h-4 w-4 animate-spin" />
                            Loading chart...
                          </div>
                        ) : commentModerationRows.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-sm text-gray-500">No comments yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={commentModerationRows} dataKey="count" nameKey="status" outerRadius={80}>
                                {commentModerationRows.map((_, index) => (
                                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={chartCardClass}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">Recent Activities</div>
                      <div className="text-sm text-gray-600">Last 10 actions recorded by the platform</div>
                    </div>
                    {(overviewLoading || logsLoading) && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {activityLogs.slice(0, 10).length > 0 ? (
                          activityLogs.slice(0, 10).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user_name ?? 'System'}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{log.activity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                              No activities yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Payout account</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign balance</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingWithdrawals.length > 0 ? (
                        pendingWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{withdrawal.campaign_title}</td>
                            <td className="px-6 py-4 text-gray-700">{withdrawal.organizer_name}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">ETB {withdrawal.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div>{withdrawal.bank_account}</div>
                              {withdrawal.campaign_bank_account && withdrawal.campaign_bank_account !== withdrawal.bank_account ? (
                                <div className="mt-1 text-xs text-gray-500">Registered: {withdrawal.campaign_bank_account}</div>
                              ) : null}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">ETB {withdrawal.raised_amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-gray-700">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateWithdrawalStatus(withdrawal.id, 'approved')}
                                  disabled={updatingWithdrawalStatus}
                                  className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                                  title="Approve Withdrawal"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateWithdrawalStatus(withdrawal.id, 'rejected')}
                                  disabled={updatingWithdrawalStatus}
                                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                  title="Reject Withdrawal"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No pending withdrawals.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div>
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Contact form messages</h2>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'new', 'read', 'archived'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setContactFilter(filter)}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                          contactFilter === filter ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                {contactMessagesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                    <Loader className="h-5 w-5 animate-spin" />
                    Loading messages...
                  </div>
                ) : filteredContactMessages.length > 0 ? (
                  <div className="space-y-4">
                    {filteredContactMessages.map((message) => (
                      <div key={message.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                              <Mail className="h-4 w-4 text-green-600" />
                              {message.name}
                            </div>
                            <a href={`mailto:${message.email}`} className="text-sm text-green-700 hover:underline">
                              {message.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                message.status === 'new'
                                  ? 'bg-orange-100 text-orange-700'
                                  : message.status === 'read'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {message.status}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="mb-4 whitespace-pre-wrap text-gray-700">{message.message}</p>
                        <div className="flex flex-wrap gap-2">
                          {message.status !== 'read' && (
                            <button
                              type="button"
                              disabled={updatingContactMessage}
                              onClick={() => void handleContactStatusUpdate(message.id, 'read')}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Mark read
                            </button>
                          )}
                          {message.status !== 'archived' && (
                            <button
                              type="button"
                              disabled={updatingContactMessage}
                              onClick={() => void handleContactStatusUpdate(message.id, 'archived')}
                              className="inline-flex items-center gap-1 rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </button>
                          )}
                          {message.status !== 'new' && (
                            <button
                              type="button"
                              disabled={updatingContactMessage}
                              onClick={() => void handleContactStatusUpdate(message.id, 'new')}
                              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              Mark as new
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center text-gray-500">No contact messages in this view.</p>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All comments</h2>
                    {(allCommentsLoading || commentsLoading) && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader className="h-4 w-4 animate-spin" />
                        Loading comments...
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Campaign</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">User</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Comment</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {allComments.length > 0 ? (
                          allComments.map((comment) => (
                            <tr key={comment.id} className={`hover:bg-gray-50 ${selectedCommentId === comment.id ? 'bg-green-50/60' : ''}`}>
                              <td className="px-6 py-4 font-semibold text-gray-900">{comment.campaign_title}</td>
                              <td className="px-6 py-4 text-gray-700">{comment.user_name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    comment.moderation_status === 'approved'
                                      ? 'bg-green-100 text-green-700'
                                      : comment.moderation_status === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {comment.moderation_status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                <p className="max-w-md whitespace-pre-wrap break-words">{comment.message}</p>
                                <p className="mt-2 text-xs text-gray-500">{comment.moderation_reason}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-700">{new Date(comment.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleSelectComment(comment.id)}
                                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No comments found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">Override review</h3>
                  {selectedComment ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-700">{selectedComment.campaign_title}</div>
                        <div className="text-sm text-gray-600">By {selectedComment.user_name}</div>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-sm text-gray-700 shadow-sm">
                        <div className="whitespace-pre-wrap break-words">{selectedComment.message}</div>
                      </div>
                      <div className="grid gap-3">
                        <label className="text-sm font-medium text-gray-700">
                          Decision
                          <select
                            value={overrideDecision}
                            onChange={(event) => setOverrideDecision(event.target.value as 'approved' | 'rejected')}
                            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-green-500"
                          >
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                          </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">
                          Reason
                          <textarea
                            value={overrideReason}
                            onChange={(event) => setOverrideReason(event.target.value)}
                            rows={4}
                            placeholder="Optional reason for the override"
                            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-green-500"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCommentReview()}
                        disabled={reviewingComment}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {reviewingComment ? 'Saving...' : 'Save override'}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                      Select a comment to override its moderation decision.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Activity log</h2>
                  {logsLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading activity...
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {activityLogs.length > 0 ? (
                        activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{log.user_name ?? 'System'}</td>
                            <td className="px-6 py-4 text-gray-700">{log.user_role ?? 'system'}</td>
                            <td className="px-6 py-4 text-gray-700">{log.activity}</td>
                            <td className="px-6 py-4 text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No activity logs yet.</td>
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
