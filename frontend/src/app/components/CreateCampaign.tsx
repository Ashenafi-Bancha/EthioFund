import { useState } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';

interface CreateCampaignProps {
  onNavigate: (page: string) => void;
}

export function CreateCampaign({ onNavigate }: CreateCampaignProps) {
  const { user: currentUser } = useAuth();
  const { createCampaign } = useCreateCampaign();
  const [formData, setFormData] = useState({
    title: '',
    category: 'education',
    location: '',
    goalAmount: '',
    duration: '30',
    description: '',
    story: '',
    bankAccount: '',
    phoneNumber: ''
  });

  const [campaignImageFile, setCampaignImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const categories = [
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'funeral', label: 'Funeral' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'community', label: 'Community' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCampaignImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocs = Array.from(files);
      setDocuments([...documents, ...newDocs]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.location.trim() || !formData.goalAmount.trim() || !formData.description.trim() || !formData.story.trim() || !formData.bankAccount.trim() || !formData.phoneNumber.trim() || !campaignImageFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('You must agree to the terms before submitting your campaign');
      return;
    }

    if (parseFloat(formData.goalAmount) <= 0) {
      toast.error('Goal amount must be greater than zero');
      return;
    }
    const result = await createCampaign({
      title: formData.title,
      description: formData.description,
      story: formData.story,
      category: formData.category,
      location: formData.location,
      goal_amount: parseFloat(formData.goalAmount),
      duration_days: parseInt(formData.duration, 10),
      campaign_image: campaignImageFile,
      supporting_documents: documents,
    });

    if (result) {
      toast.success('Campaign created successfully! It will be reviewed by our team.');
      setTimeout(() => onNavigate('organizer-dashboard'), 1500);
    } else {
      toast.error('Failed to create campaign. Please try again.');
    }
  };

  if (!currentUser) return null;

  const canSubmit = Boolean(
    formData.title.trim() &&
      formData.location.trim() &&
      formData.goalAmount.trim() &&
      formData.description.trim() &&
      formData.story.trim() &&
      formData.bankAccount.trim() &&
      formData.phoneNumber.trim() &&
        campaignImageFile &&
      agreedToTerms &&
      parseFloat(formData.goalAmount) > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('organizer-dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
          <p className="text-gray-600">Fill in the details below to start your fundraising campaign</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funding Goal (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 500000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Brief description of your campaign (max 200 characters)"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/200 characters
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Story */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Story</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tell Your Story <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={8}
                placeholder="Explain why you need funding, how it will be used, and the impact it will make..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Be specific about your goals, timeline, and how funds will be allocated.
              </p>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Image</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Campaign Image <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Campaign preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setCampaignImageFile(null);
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                      Select Image
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Documents</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload documents to verify your campaign (ID, project proposal, permits, etc.)
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="doc-upload"
                />
                <label
                  htmlFor="doc-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Upload Documents
                </label>
                
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                          className="ml-auto text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., CBE - 1000123456789"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Funds will be transferred to this account upon approval
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+251 91 234 5678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(event) => setAgreedToTerms(event.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <button type="button" className="text-green-600 hover:text-green-700">Terms of Service</button> and confirm that all information provided is accurate and truthful. I understand that my campaign will be reviewed before being published.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => onNavigate('organizer-dashboard')}
                className="flex-1 rounded-lg bg-red-50 px-6 py-3 text-red-700 transition-all hover:bg-red-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 px-6 py-3 text-white shadow-md transition-all hover:from-green-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Submit for Review
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
