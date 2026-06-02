import { useState } from 'react';
import {
  X,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
  MessageCircle,
  Check,
  Send,
  ArrowLeft,
  Share2,
  ChevronDown,
} from 'lucide-react';
import type { CampaignResponse } from '../hooks/useCampaigns';
import { toast } from 'sonner';
import { apiRequest } from '../lib/api';

interface ShareCampaignModalProps {
  campaign: CampaignResponse;
  onClose: () => void;
  onShare?: () => void;
}

export function ShareCampaignModal({ campaign, onClose, onShare }: ShareCampaignModalProps) {
  const [copied, setCopied] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ethiofund.com';
  const campaignUrl = campaign.share_url || `${origin}/campaigns/${campaign.id}`;
  const shareText = `${campaign.title} — ${campaign.description}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(campaignUrl);
      } else {
        fallbackCopy(campaignUrl);
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
      void recordShare('copy_link');
    } catch {
      fallbackCopy(campaignUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
      void recordShare('copy_link');
    } catch {
      toast.error('Could not copy link');
    }
    document.body.removeChild(textArea);
  };

  const recordShare = async (provider?: string) => {
    try {
      await apiRequest(`/campaigns/${campaign.id}/share`, {
        method: 'POST',
        body: JSON.stringify({ provider }),
      });
      onShare?.();
    } catch {
      console.warn('Failed to record share');
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
    },
    {
      name: 'X',
      icon: Twitter,
      color: 'bg-sky-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${campaignUrl}`)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc]',
      url: `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      url: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(`${shareText}\n\n${campaignUrl}`)}`,
    },
  ];

  const handleNativeShare = async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (!nav.share) {
      await handleCopyLink();
      return;
    }
    try {
      await nav.share({ title: campaign.title, text: shareText, url: campaignUrl });
      void recordShare('native');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Share cancelled or unavailable');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 id="share-modal-title" className="text-base font-semibold text-gray-900">
            Share campaign
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="mb-4 flex gap-3 rounded-xl bg-gray-50 p-3">
            <img
              src={campaign.image_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">{campaign.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{campaign.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy campaign link'}
          </button>

          {typeof navigator !== 'undefined' && (navigator as Navigator & { share?: unknown }).share ? (
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              Share via device
            </button>
          ) : null}

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Share on</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void recordShare(link.name.toLowerCase())}
                className={`flex min-w-[4.5rem] flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-white transition-opacity hover:opacity-90 ${link.color}`}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{link.name}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowExtras((open) => !open)}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            More options
            <ChevronDown className={`h-4 w-4 transition-transform ${showExtras ? 'rotate-180' : ''}`} />
          </button>

          {showExtras && (
            <div className="mt-3 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <EmbedSnippet
                campaignId={campaign.id}
                origin={origin}
                onEmbedCopy={() => void recordShare('embed')}
              />
              <p className="text-xs leading-relaxed text-gray-600">
                Sharing helps this campaign reach more supporters. Every share can bring new donors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmbedSnippet({
  campaignId,
  origin,
  onEmbedCopy,
}: {
  campaignId: string;
  origin: string;
  onEmbedCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const embedSrc = `${origin}/embed/campaign/${campaignId}`;
  const code = `<iframe src="${embedSrc}" width="100%" height="360" style="border:0;border-radius:12px;max-width:480px;" loading="lazy" title="EthioFund campaign"></iframe>`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onEmbedCopy?.();
      toast.success('Embed code copied');
    } catch {
      toast.error('Could not copy embed code');
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-700">Embed on your site</p>
      <button
        type="button"
        onClick={() => void copyCode()}
        className={`w-full rounded-lg py-2 text-xs font-semibold ${
          copied ? 'bg-green-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100'
        }`}
      >
        {copied ? 'Copied embed code' : 'Copy embed code'}
      </button>
    </div>
  );
}
