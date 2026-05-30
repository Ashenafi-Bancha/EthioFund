export interface Campaign {
  id: string;
  title: string;
  organizer: string;
  organizerId: string;
  category: string;
  description: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  daysLeft: number;
  image: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  verified: boolean;
  createdAt: string;
  location: string;
  beneficiary?: string;
  beneficiaryRelationship?: string;
  hasDeadline: boolean;
  deadline?: string;
  images: string[];
  videos: string[];
  teamMembers: string[];
  tags: string[];
  updates: CampaignUpdate[];
  milestones: Milestone[];
  isFeatured: boolean;
  isTrending: boolean;
  offlineDonations: number;
  withdrawnAmount: number;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  createdBy: string;
}

export interface Milestone {
  id: string;
  amount: number;
  description: string;
  reached: boolean;
  reachedDate?: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorId: string;
  amount: number;
  paymentMethod: string;
  paymentProvider: 'chapa';
  date: string;
  anonymous: boolean;
  message?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly';
  tipAmount?: number;
  receiptUrl?: string;
}

export interface Comment {
  id: string;
  campaignId: string;
  userName: string;
  userId: string;
  comment: string;
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  campaignId: string;
  campaignTitle: string;
  organizerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  bankAccount: string;
  reason: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa',
    organizer: 'Addis Community Health Collective',
    organizerId: 'org1',
    category: 'Healthcare',
    description: 'Help cover urgent surgery, medicine, and recovery care for Hana at Tikur Anbessa Specialized Hospital in Addis Ababa, Ethiopia.',
    story: 'Hana is a mother in Addis Ababa who needs urgent surgery and post-operative support. Donations will help pay for hospital admission, treatment, medicine, and recovery costs so she can return home safely to her family.',
    goalAmount: 450000,
    raisedAmount: 238000,
    donorCount: 94,
    daysLeft: 19,
    image: 'https://images.unsplash.com/photo-1580281657527-47f249e8f91c?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
    verified: true,
    createdAt: '2026-01-05',
    location: 'Addis Ababa, Ethiopia',
    beneficiary: 'Hana and her family',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-02-20',
    images: [
      'https://images.unsplash.com/photo-1580281657527-47f249e8f91c?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    teamMembers: ['Dr. Almaz Bekele', 'Mekonnen Tadesse'],
    tags: ['Healthcare', 'Medical Care', 'Addis Ababa, Ethiopia'],
    updates: [
      {
        id: 'u1',
        campaignId: '1',
        title: 'Surgery Preparation Completed',
        content: 'The medical team has completed Hana\'s pre-surgery evaluation and is preparing for the procedure this week.',
        images: [
          'https://images.unsplash.com/photo-1580281657527-47f249e8f91c?auto=format&fit=crop&w=1200&q=80'
        ],
        createdAt: '2026-01-10',
        createdBy: 'Dr. Almaz Bekele'
      }
    ],
    milestones: [
      {
        id: 'm1',
        amount: 150000,
        description: 'Surgery deposit secured',
        reached: true,
        reachedDate: '2026-01-15'
      },
      {
        id: 'm2',
        amount: 300000,
        description: 'Treatment and recovery support covered',
        reached: false
      }
    ],
    isFeatured: true,
    isTrending: true,
    offlineDonations: 35000,
    withdrawnAmount: 80000
  },
  {
    id: '2',
    title: 'Ethiopia Education Support for Rural Oromia Students',
    organizer: 'Oromia Education Network',
    organizerId: 'org2',
    category: 'Education',
    description: 'Support desks, books, school supplies, and learning materials for students in rural Oromia, Ethiopia.',
    story: 'Children in rural Oromia still travel long distances to reach under-resourced schools. This campaign supports classroom materials, textbooks, and study supplies so more students can stay in school and learn with dignity.',
    goalAmount: 320000,
    raisedAmount: 176000,
    donorCount: 112,
    daysLeft: 26,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
    verified: true,
    createdAt: '2026-01-10',
    location: 'Oromia Region, Ethiopia',
    beneficiary: 'Students and teachers in rural Oromia',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-03-10',
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    teamMembers: ['Aster Abebe', 'Tigist Alemu'],
    tags: ['Education', 'Schools', 'Oromia Region, Ethiopia'],
    updates: [
      {
        id: 'u2',
        campaignId: '2',
        title: 'First Learning Materials Delivered',
        content: 'The first batch of books and classroom supplies has reached the partner schools in rural Oromia.',
        images: [
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80'
        ],
        createdAt: '2026-01-12',
        createdBy: 'Tigist Alemu'
      }
    ],
    milestones: [
      {
        id: 'm3',
        amount: 120000,
        description: 'Books and supplies delivered',
        reached: true,
        reachedDate: '2026-01-12'
      },
      {
        id: 'm4',
        amount: 250000,
        description: 'Classroom support expanded to more schools',
        reached: false
      }
    ],
    isFeatured: true,
    isTrending: false,
    offlineDonations: 28000,
    withdrawnAmount: 60000
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    campaignTitle: 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa',
    donorName: 'Aster Abebe',
    donorId: 'donor1',
    amount: 12000,
    paymentMethod: 'Telebirr',
    paymentProvider: 'chapa',
    date: '2026-01-24',
    anonymous: false,
    message: 'May Hana recover quickly and safely.',
    isRecurring: false
  },
  {
    id: 'd2',
    campaignId: '2',
    campaignTitle: 'Ethiopia Education Support for Rural Oromia Students',
    donorName: 'Anonymous',
    donorId: 'donor1',
    amount: 9000,
    paymentMethod: 'CBE Birr',
    paymentProvider: 'chapa',
    date: '2026-01-23',
    anonymous: true,
    isRecurring: false
  },
  {
    id: 'd3',
    campaignId: '1',
    campaignTitle: 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa',
    donorName: 'Mekonnen Tadesse',
    donorId: 'donor1',
    amount: 6000,
    paymentMethod: 'Chapa',
    paymentProvider: 'chapa',
    date: '2026-01-20',
    anonymous: false,
    message: 'Sending support from Addis Ababa.',
    isRecurring: false
  }
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    campaignId: '1',
    userName: 'Saba Tesfaye',
    userId: 'user1',
    comment: 'Wishing Hana a safe recovery.',
    date: '2026-01-25'
  },
  {
    id: 'c2',
    campaignId: '2',
    userName: 'Abdi Hassan',
    userId: 'user2',
    comment: 'Great support for the students.',
    date: '2026-01-24'
  },
  {
    id: 'c3',
    campaignId: '2',
    userName: 'Mulugeta Bekele',
    userId: 'user3',
    comment: 'Happy to support this project.',
    date: '2026-01-23'
  }
];

export const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w1',
    campaignId: '1',
    campaignTitle: 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa',
    organizerId: 'org1',
    amount: 150000,
    status: 'pending',
    requestDate: '2026-01-25',
    bankAccount: 'CBE - 1000123456789',
    reason: 'Hospital deposit, medication, and immediate post-surgery care'
  },
  {
    id: 'w2',
    campaignId: '2',
    campaignTitle: 'Ethiopia Education Support for Rural Oromia Students',
    organizerId: 'org2',
    amount: 80000,
    status: 'approved',
    requestDate: '2026-01-20',
    bankAccount: 'CBE - 1000987654321',
    reason: 'Books, desks, school supplies, and classroom materials'
  }
];