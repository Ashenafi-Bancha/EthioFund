import { useState } from 'react';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { CampaignUpdate } from '../data/mockData';
import { User } from '../App';
import { toast } from 'sonner';

interface CampaignUpdatesProps {
  updates: CampaignUpdate[];
  campaignId: string;
  isOrganizer: boolean;
  currentUser: User | null;
}

export function CampaignUpdates({ updates, campaignId, isOrganizer, currentUser }: CampaignUpdatesProps) {
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');

  const handlePostUpdate = () => {
    if (!newUpdateTitle.trim() || !newUpdateContent.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    // In a real app, this would make an API call
    toast.success('Update posted successfully!');
    setNewUpdateTitle('');
    setNewUpdateContent('');
    setShowAddUpdate(false);
  };

  return (
    <div className="space-y-6">
      {isOrganizer && currentUser && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {!showAddUpdate ? (
            <button
              onClick={() => setShowAddUpdate(true)}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
            >
              Post an Update
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Post Campaign Update</h3>
              <input
                type="text"
                value={newUpdateTitle}
                onChange={(e) => setNewUpdateTitle(e.target.value)}
                placeholder="Update title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <textarea
                value={newUpdateContent}
                onChange={(e) => setNewUpdateContent(e.target.value)}
                placeholder="Share your progress, achievements, or challenges..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={5}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddUpdate(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostUpdate}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                >
                  Post Update
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No updates yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{update.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(update.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span>•</span>
                    <span>By {update.createdBy}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 whitespace-pre-line">{update.content}</p>
              
              {update.images && update.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {update.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Update ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
