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
    title: 'Build a School in Rural Oromia',
    organizer: 'Abebe Kebede',
    organizerId: 'org1',
    category: 'Education',
    description: 'Help us build a primary school for 200 children in rural Oromia region.',
    story: 'Our village has been without a proper school for decades. Children walk 10km daily to the nearest school. We need your support to build a modern facility with classrooms, library, and clean water access.',
    goalAmount: 500000,
    raisedAmount: 342000,
    donorCount: 156,
    daysLeft: 23,
    image: 'https://images.unsplash.com/photo-1666281269793-da06484657e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZWR1Y2F0aW9uJTIwY2hpbGRyZW58ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-05',
    location: 'Oromia Region',
    beneficiary: 'Children of rural Oromia',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-02-28',
    images: [
      'https://images.unsplash.com/photo-1666281269793-da06484657e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZWR1Y2F0aW9uJTIwY2hpbGRyZW58ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Abebe Kebede', 'Tigist Alemu'],
    tags: ['Education', 'School', 'Rural Oromia'],
    updates: [
      {
        id: 'u1',
        campaignId: '1',
        title: 'Construction Begins',
        content: 'The construction of the school has officially started. We are on track to complete the project by the deadline.',
        images: [
          'https://images.unsplash.com/photo-1666281269793-da06484657e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZWR1Y2F0aW9uJTIwY2hpbGRyZW58ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-10',
        createdBy: 'Abebe Kebede'
      }
    ],
    milestones: [
      {
        id: 'm1',
        amount: 100000,
        description: 'Foundation laid',
        reached: true,
        reachedDate: '2026-01-15'
      },
      {
        id: 'm2',
        amount: 200000,
        description: 'Classrooms completed',
        reached: false
      }
    ],
    isFeatured: true,
    isTrending: false,
    offlineDonations: 50000,
    withdrawnAmount: 100000
  },
  {
    id: '2',
    title: 'Medical Equipment for Addis Clinic',
    organizer: 'Dr. Sara Tesfaye',
    organizerId: 'org2',
    category: 'Healthcare',
    description: 'Urgent need for essential medical equipment to serve 5,000 patients monthly.',
    story: 'Our community clinic serves thousands of patients but lacks basic diagnostic equipment. Your donation will help us purchase ultrasound machines, X-ray equipment, and laboratory supplies.',
    goalAmount: 300000,
    raisedAmount: 187000,
    donorCount: 89,
    daysLeft: 15,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGFmcmljYXxlbnwxfHx8fDE3Njk0NTg4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-10',
    location: 'Addis Ababa',
    beneficiary: 'Patients of Addis Clinic',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-02-15',
    images: [
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGFmcmljYXxlbnwxfHx8fDE3Njk0NTg4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Dr. Sara Tesfaye'],
    tags: ['Healthcare', 'Medical Equipment', 'Addis Clinic'],
    updates: [
      {
        id: 'u2',
        campaignId: '2',
        title: 'Equipment Ordered',
        content: 'We have ordered the necessary medical equipment and are awaiting delivery.',
        images: [
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGFmcmljYXxlbnwxfHx8fDE3Njk0NTg4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-12',
        createdBy: 'Dr. Sara Tesfaye'
      }
    ],
    milestones: [
      {
        id: 'm3',
        amount: 100000,
        description: 'Equipment ordered',
        reached: true,
        reachedDate: '2026-01-12'
      },
      {
        id: 'm4',
        amount: 200000,
        description: 'Equipment delivered',
        reached: false
      }
    ],
    isFeatured: false,
    isTrending: true,
    offlineDonations: 20000,
    withdrawnAmount: 50000
  },
  {
    id: '3',
    title: 'Clean Water Well Project',
    organizer: 'Tigist Alemu',
    organizerId: 'org3',
    category: 'Water & Sanitation',
    description: 'Provide clean drinking water to 3 villages in the Amhara region.',
    story: 'Clean water is a basic human right, yet our villages still rely on contaminated sources. This project will drill deep wells and install hand pumps, benefiting over 2,000 people.',
    goalAmount: 150000,
    raisedAmount: 98000,
    donorCount: 67,
    daysLeft: 30,
    image: 'https://images.unsplash.com/photo-1760873059715-7c7cfbe2a2c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHdlbGwlMjBhZnJpY2F8ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-15',
    location: 'Amhara Region',
    beneficiary: 'Villagers of Amhara Region',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-03-15',
    images: [
      'https://images.unsplash.com/photo-1760873059715-7c7cfbe2a2c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHdlbGwlMjBhZnJpY2F8ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Tigist Alemu'],
    tags: ['Water & Sanitation', 'Clean Water', 'Amhara Region'],
    updates: [
      {
        id: 'u3',
        campaignId: '3',
        title: 'Site Survey Completed',
        content: 'We have completed the site survey and are ready to start drilling the wells.',
        images: [
          'https://images.unsplash.com/photo-1760873059715-7c7cfbe2a2c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHdlbGwlMjBhZnJpY2F8ZW58MXx8fHwxNzY5NDU4ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-16',
        createdBy: 'Tigist Alemu'
      }
    ],
    milestones: [
      {
        id: 'm5',
        amount: 50000,
        description: 'Site survey completed',
        reached: true,
        reachedDate: '2026-01-16'
      },
      {
        id: 'm6',
        amount: 100000,
        description: 'Wells drilled',
        reached: false
      }
    ],
    isFeatured: false,
    isTrending: false,
    offlineDonations: 10000,
    withdrawnAmount: 20000
  },
  {
    id: '4',
    title: 'Women Entrepreneurs Fund',
    organizer: 'Mekdes Hailu',
    organizerId: 'org1',
    category: 'Business',
    description: 'Support 20 women-led small businesses with startup capital and training.',
    story: 'Ethiopian women entrepreneurs face significant barriers to starting businesses. This fund provides micro-loans and business training to help women achieve financial independence.',
    goalAmount: 200000,
    raisedAmount: 145000,
    donorCount: 103,
    daysLeft: 18,
    image: 'https://images.unsplash.com/photo-1680197127995-cc201a418961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwZW50cmVwcmVuZXVyfGVufDF8fHx8MTc2OTQ1ODg4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-12',
    location: 'Dire Dawa',
    beneficiary: 'Women entrepreneurs in Dire Dawa',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-02-30',
    images: [
      'https://images.unsplash.com/photo-1680197127995-cc201a418961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwZW50cmVwcmVuZXVyfGVufDF8fHx8MTc2OTQ1ODg4NXww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Mekdes Hailu'],
    tags: ['Business', 'Women Entrepreneurs', 'Dire Dawa'],
    updates: [
      {
        id: 'u4',
        campaignId: '4',
        title: 'First Batch of Loans Disbursed',
        content: 'We have disbursed the first batch of micro-loans to 5 women entrepreneurs.',
        images: [
          'https://images.unsplash.com/photo-1680197127995-cc201a418961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwZW50cmVwcmVuZXVyfGVufDF8fHx8MTc2OTQ1ODg4NXww&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-15',
        createdBy: 'Mekdes Hailu'
      }
    ],
    milestones: [
      {
        id: 'm7',
        amount: 50000,
        description: 'First batch of loans disbursed',
        reached: true,
        reachedDate: '2026-01-15'
      },
      {
        id: 'm8',
        amount: 100000,
        description: 'Second batch of loans disbursed',
        reached: false
      }
    ],
    isFeatured: false,
    isTrending: true,
    offlineDonations: 15000,
    withdrawnAmount: 30000
  },
  {
    id: '5',
    title: 'Sustainable Farming Initiative',
    organizer: 'Yohannes Bekele',
    organizerId: 'org4',
    category: 'Agriculture',
    description: 'Modern irrigation system for 50 smallholder farmers in SNNPR.',
    story: 'Climate change has made traditional farming difficult. We need modern irrigation systems and drought-resistant seeds to ensure food security for our community.',
    goalAmount: 180000,
    raisedAmount: 67000,
    donorCount: 41,
    daysLeft: 45,
    image: 'https://images.unsplash.com/photo-1729589985474-7df55c987ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm1pbmclMjBjb21tdW5pdHl8ZW58MXx8fHwxNzY5NDU4ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-20',
    location: 'SNNPR',
    beneficiary: 'Smallholder farmers in SNNPR',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-03-31',
    images: [
      'https://images.unsplash.com/photo-1729589985474-7df55c987ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm1pbmclMjBjb21tdW5pdHl8ZW58MXx8fHwxNzY5NDU4ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Yohannes Bekele'],
    tags: ['Agriculture', 'Irrigation System', 'SNNPR'],
    updates: [
      {
        id: 'u5',
        campaignId: '5',
        title: 'Irrigation System Design Completed',
        content: 'We have completed the design of the irrigation system and are ready to start installation.',
        images: [
          'https://images.unsplash.com/photo-1729589985474-7df55c987ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm1pbmclMjBjb21tdW5pdHl8ZW58MXx8fHwxNzY5NDU4ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-22',
        createdBy: 'Yohannes Bekele'
      }
    ],
    milestones: [
      {
        id: 'm9',
        amount: 50000,
        description: 'Irrigation system design completed',
        reached: true,
        reachedDate: '2026-01-22'
      },
      {
        id: 'm10',
        amount: 100000,
        description: 'Irrigation system installed',
        reached: false
      }
    ],
    isFeatured: false,
    isTrending: false,
    offlineDonations: 10000,
    withdrawnAmount: 20000
  },
  {
    id: '6',
    title: 'Emergency Flood Relief',
    organizer: 'Relief Organization',
    organizerId: 'org5',
    category: 'Emergency',
    description: 'Immediate assistance for families displaced by recent flooding.',
    story: 'Recent floods have displaced 500 families. We need urgent funds for temporary shelter, food, and medical supplies.',
    goalAmount: 400000,
    raisedAmount: 289000,
    donorCount: 234,
    daysLeft: 7,
    image: 'https://images.unsplash.com/photo-1676969048242-0669dcb69762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBjb21tdW5pdHklMjBoZWxwaW5nfGVufDF8fHx8MTc2OTQ1ODg4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    verified: true,
    createdAt: '2026-01-22',
    location: 'Gambela Region',
    beneficiary: 'Families displaced by floods',
    beneficiaryRelationship: 'Direct beneficiaries',
    hasDeadline: true,
    deadline: '2026-01-30',
    images: [
      'https://images.unsplash.com/photo-1676969048242-0669dcb69762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBjb21tdW5pdHklMjBoZWxwaW5nfGVufDF8fHx8MTc2OTQ1ODg4M3ww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    videos: [],
    teamMembers: ['Relief Organization'],
    tags: ['Emergency', 'Flood Relief', 'Gambela Region'],
    updates: [
      {
        id: 'u6',
        campaignId: '6',
        title: 'Shelter and Supplies Distributed',
        content: 'We have distributed temporary shelters and essential supplies to 500 families.',
        images: [
          'https://images.unsplash.com/photo-1676969048242-0669dcb69762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBjb21tdW5pdHklMjBoZWxwaW5nfGVufDF8fHx8MTc2OTQ1ODg4M3ww&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        createdAt: '2026-01-25',
        createdBy: 'Relief Organization'
      }
    ],
    milestones: [
      {
        id: 'm11',
        amount: 100000,
        description: 'Shelter and supplies distributed',
        reached: true,
        reachedDate: '2026-01-25'
      },
      {
        id: 'm12',
        amount: 200000,
        description: 'Long-term housing provided',
        reached: false
      }
    ],
    isFeatured: true,
    isTrending: true,
    offlineDonations: 50000,
    withdrawnAmount: 100000
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    campaignTitle: 'Build a School in Rural Oromia',
    donorName: 'John Doe',
    donorId: 'donor1',
    amount: 5000,
    paymentMethod: 'Telebirr',
    paymentProvider: 'chapa',
    date: '2026-01-24',
    anonymous: false,
    message: 'Education is the key to a better future!',
    isRecurring: false
  },
  {
    id: 'd2',
    campaignId: '2',
    campaignTitle: 'Medical Equipment for Addis Clinic',
    donorName: 'Anonymous',
    donorId: 'donor1',
    amount: 3000,
    paymentMethod: 'CBE Birr',
    paymentProvider: 'chapa',
    date: '2026-01-23',
    anonymous: true,
    isRecurring: false
  },
  {
    id: 'd3',
    campaignId: '1',
    campaignTitle: 'Build a School in Rural Oromia',
    donorName: 'John Doe',
    donorId: 'donor1',
    amount: 2000,
    paymentMethod: 'Chapa',
    paymentProvider: 'chapa',
    date: '2026-01-20',
    anonymous: false,
    message: 'Keep up the great work!',
    isRecurring: false
  }
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    campaignId: '1',
    userName: 'Sarah Miller',
    userId: 'user1',
    comment: 'This is such an important initiative! Wishing you success!',
    date: '2026-01-25'
  },
  {
    id: 'c2',
    campaignId: '1',
    userName: 'Ahmed Hassan',
    userId: 'user2',
    comment: 'I grew up in a similar situation. Education changed my life. Supporting this 100%!',
    date: '2026-01-24'
  },
  {
    id: 'c3',
    campaignId: '2',
    userName: 'Lisa Johnson',
    userId: 'user3',
    comment: 'Healthcare is a fundamental right. Thank you for your work!',
    date: '2026-01-23'
  }
];

export const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w1',
    campaignId: '1',
    campaignTitle: 'Build a School in Rural Oromia',
    organizerId: 'org1',
    amount: 200000,
    status: 'pending',
    requestDate: '2026-01-25',
    bankAccount: 'CBE - 1000123456789',
    reason: 'Phase 1 construction materials and labor costs'
  },
  {
    id: 'w2',
    campaignId: '4',
    campaignTitle: 'Women Entrepreneurs Fund',
    organizerId: 'org1',
    amount: 50000,
    status: 'approved',
    requestDate: '2026-01-20',
    bankAccount: 'CBE - 1000123456789',
    reason: 'First batch of micro-loans for 5 entrepreneurs'
  }
];