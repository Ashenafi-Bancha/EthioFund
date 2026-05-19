import { useState } from 'react';
import { X, Facebook, Twitter, Mail, Link as LinkIcon, MessageCircle, Check, Send } from 'lucide-react';
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ethiofund.com';
  const campaignUrl = `${origin}/campaign/${campaign.id}`;
  const shareText = `${campaign.title} — ${campaign.description}`;

  const handleCopyLink = () => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(campaignUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          void recordShare('copy_link');
        })
        .catch(() => {
          // Fallback to older method
          fallbackCopyTextToClipboard(campaignUrl);
        });
    } else {
      // Use fallback for browsers that don't support Clipboard API
      fallbackCopyTextToClipboard(campaignUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void recordShare('copy_link');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Copy failed. Please manually copy the link from the field.');
    }
    
    document.body.removeChild(textArea);
  };

  const recordShare = async (provider?: string) => {
    try {
      // Fire-and-forget to backend to increment share count
      await apiRequest(`/campaigns/${campaign.id}/share`, { method: 'POST', body: JSON.stringify({ provider }) });
      if (typeof onShare === 'function') onShare();
    } catch (err) {
      // Don't block the user; log error
      console.warn('Failed to record share', err);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + campaignUrl)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(shareText + '\n\n' + campaignUrl)}`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Share Campaign</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Campaign Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{campaign.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-700">Share via</p>
            <div className="grid grid-cols-2 gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void recordShare(link.name.toLowerCase())}
                  className={`${link.color} text-white p-4 rounded-lg transition-all flex items-center gap-3 hover:shadow-md`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-semibold">{link.name}</span>
                </a>
              ))}

              {/* Native share (if available) and Instagram fallback */}
              {typeof navigator !== 'undefined' && (navigator as any).share ? (
                <button
                  onClick={() => {
                    (navigator as any)
                      .share({
                        title: campaign.title,
                        text: shareText,
                        url: campaignUrl,
                      })
                      .then(() => void recordShare('native'))
                      .catch(() => {
                        toast.error('Unable to open share sheet');
                      });
                  }}
                  className="col-span-2 bg-gray-900 text-white p-4 rounded-lg flex items-center gap-3 justify-center hover:opacity-95"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="font-semibold">Share...</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Instagram has no web share endpoint — instruct user to copy link
                    handleCopyLink();
                    toast.success('Link copied — paste into Instagram to share');
                    void recordShare('instagram');
                  }}
                  className="col-span-2 bg-pink-600 text-white p-4 rounded-lg flex items-center gap-3 justify-center hover:opacity-95"
                >
                  <Send className="w-5 h-5" />
                  <span className="font-semibold">Share to Instagram (copy link)</span>
                </button>
              )}
            </div>
          </div>

          {/* Copy Link */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Or copy link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={campaignUrl}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <LinkIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>
            )}
          </div>

          {/* Embed Snippet */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Embed this campaign</p>
            <EmbedSnippet campaignId={campaign.id} origin={origin} onEmbedCopy={() => void recordShare('embed')} />
          </div>

          {/* Impact Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Did you know?</span> Campaigns that are shared on social media raise up to 5x more than those that aren't. Help spread the word!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedSnippet({ campaignId, origin, onEmbedCopy }: { campaignId: string; origin: string; onEmbedCopy?: () => void }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSrc = `${origin}/embed/campaign/${campaignId}`;
  const code = `<iframe src="${embedSrc}" width="600" height="400" frameborder="0" loading="lazy" style="border:0;border-radius:8px;"></iframe>`;

  const copyCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onEmbedCopy) onEmbedCopy();
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onEmbedCopy) onEmbedCopy();
      } catch {
        // fallback
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowCode((s) => !s)} className="px-4 py-2 bg-gray-100 rounded-md text-sm">
          {showCode ? 'Hide embed' : 'Show embed code'}
        </button>
        <button onClick={copyCode} className={`px-4 py-2 rounded-md text-sm ${copied ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>
          {copied ? 'Copied' : 'Copy embed'}
        </button>
      </div>
      {showCode && (
        <textarea readOnly className="mt-3 w-full h-28 p-3 text-xs font-mono bg-gray-100 rounded-md" value={code} />
      )}
    </div>
  );
}