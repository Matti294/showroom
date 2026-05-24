export const AUTHORS = [
  { name: 'Matthias', title: 'Head of Development', flag: '🇩🇪' },
  { name: 'Isabel',   title: 'Head of Design',       flag: '🇩🇰' },
];

export const PROJECTS = [
  {
    slug: 'omonia',
    name: 'Omonia',
    description: 'Holistic Healing Marketplace for Copenhagen — Practitioners & Bookings',
    url: 'https://omonia.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home',          path: '/' },
      { name: 'Home New',      path: '/HomeNew' },
      { name: 'Intro',         path: '/Intro' },
      { name: 'Practitioners', path: '/Practitioners' },
      { name: 'Services',      path: '/Services' },
      { name: 'Booking',       path: '/BOOKING' },
      { name: 'Booking v2',    path: '/BOOKING2' },
      { name: 'Site Map',      path: '/SiteMap' },
    ],
    architecture: {
      note: 'Planned site structure as a basis for discussion (as of 24 May 2026). Entry point: customer first, providers visible. Click a screen to leave ideas.',
      areas: [
        {
          id: 'start', label: 'Landing (scroll)', hint: 'What happens as you scroll from top to bottom',
          screens: [
            { id: 'start-hero',         title: '1 · Hero',              description: 'Vision + search field "Find your healer in Copenhagen". Connects emotionally with customers.' },
            { id: 'start-how',          title: '2 · How it works',      description: 'Three steps: Discover → Book → Experience.' },
            { id: 'start-categories',   title: '3 · Categories',        description: 'Modalities like yoga, massage, energy work, coaching as stacked cards.' },
            { id: 'start-featured',     title: '4 · Featured providers',description: 'Preview of selected providers — makes providers visible.' },
            { id: 'start-testimonials', title: '5 · Testimonials',      description: 'Testimonials as social proof.' },
            { id: 'start-provider-cta', title: '6 · For providers',     description: 'Banner "Become part of Omonia" — transition to the provider path.' },
            { id: 'start-journal',      title: '7 · Journal teaser',    description: 'Preview of blog / events.' },
            { id: 'start-footer',       title: '8 · Footer',            description: 'Navigation, language switch, contact.' },
          ],
        },
        {
          id: 'marketplace', label: 'Marketplace (customer)', hint: 'Discover and book providers',
          screens: [
            { id: 'mp-search',           title: 'Search / Browse',       description: 'Search providers and offerings with filters.' },
            { id: 'mp-provider-profile', title: 'Provider profile',      description: 'Detail page: bio, offerings, reviews, availability.' },
            { id: 'mp-service-detail',   title: 'Offering / service detail', description: 'Single offering, price, duration.' },
            { id: 'mp-booking',          title: 'Booking',               description: 'Pick a time and confirm.' },
            { id: 'mp-confirmation',     title: 'Booking confirmation',  description: 'Confirmation after a successful booking.' },
            { id: 'mp-my-bookings',      title: 'My account: bookings',  description: 'Customer account with their bookings. (Later)' },
          ],
        },
        {
          id: 'provider', label: 'Provider area', hint: 'Present yourself and manage offerings',
          screens: [
            { id: 'pv-landing',    title: 'Provider landing',   description: '"Become a provider" — value proposition.' },
            { id: 'pv-onboarding', title: 'Onboarding',         description: 'Registration and profile setup.' },
            { id: 'pv-dashboard',  title: 'Provider dashboard', description: 'Manage profile, offerings, calendar, bookings.' },
          ],
        },
        {
          id: 'academy', label: 'Academy / Training', hint: 'Providers continue their education',
          screens: [
            { id: 'ac-landing',       title: 'Academy landing', description: 'Overview of the training offering.' },
            { id: 'ac-courses',       title: 'Course list',     description: 'List of all courses.' },
            { id: 'ac-course-detail', title: 'Course detail',   description: 'Learning content, optional certificate.' },
          ],
        },
        {
          id: 'community', label: 'Community / Content', hint: 'Journal, events, visibility',
          screens: [
            { id: 'cm-journal', title: 'Journal / Blog', description: 'Overview of articles.' },
            { id: 'cm-article', title: 'Article detail', description: 'Single article.' },
            { id: 'cm-events',  title: 'Events',         description: 'Events and workshops. (Optional)' },
          ],
        },
        {
          id: 'system', label: 'System-wide', hint: 'Pages needed everywhere',
          screens: [
            { id: 'sy-auth',    title: 'Login / Sign-up', description: 'Sign-in and account for customers and providers.' },
            { id: 'sy-about',   title: 'About us',        description: 'Story, mission, team.' },
            { id: 'sy-contact', title: 'Contact',         description: 'Contact and support.' },
            { id: 'sy-legal',   title: 'Legal',           description: 'Imprint, privacy, terms.' },
          ],
        },
      ],
    },
  },
  {
    slug: 'zen-flow',
    name: 'Zen Flow',
    description: 'Relaxation & Mindfulness App',
    url: 'https://zen-flow-hazel.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home', path: '/' },
    ],
  },
  {
    slug: 'open-mindful-living',
    name: 'Open: Mindful Living',
    description: 'Mindful Living Platform (open version)',
    url: 'https://open-mindful-living.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home',     path: '/' },
      { name: 'About',    path: '/About' },
      { name: 'Classes',  path: '/Classes',  noPreview: true },
      { name: 'Teachers', path: '/Teachers', noPreview: true },
      { name: 'FAQ',      path: '/FAQ',      noPreview: true },
    ],
  },
  {
    slug: 'sana-open',
    name: 'SANA (Open)',
    description: 'SANA — open version',
    url: 'https://sana-open.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Landing', path: '/' },
      { name: 'When',    path: '/When' },
    ],
  },
  {
    slug: 'professionell-awards',
    name: 'Professionell Awards',
    description: 'Award & Recognition Platform',
    url: 'https://professionell-awards.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home',          path: '/' },
      { name: 'Academy',       path: '/Academy' },
      { name: 'Course Detail', path: '/CourseDetail' },
      { name: 'Booking',       path: '/Booking' },
    ],
  },
  {
    slug: 'sana-vineyards',
    name: 'SANA Vineyards',
    description: 'Vineyard & Wine Experience',
    url: 'https://sana-vineyards.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home',        path: '/' },
      { name: 'Teachers',    path: '/Teachers' },
      { name: 'In Person',   path: '/InPerson',  noPreview: true },
      { name: 'Mindfulness', path: '/Mindfulness' },
    ],
  },
  {
    slug: 'futo-estate-vineyards',
    name: 'FUTO Estate Vineyards',
    description: 'Winery & Estate Presentation',
    url: 'https://futo-estate-vineyards.vercel.app',
    status: 'wip',
    pages: [
      { name: 'Home',        path: '/' },
      { name: 'Teachers',    path: '/Teachers' },
      { name: 'In Person',   path: '/InPerson',  noPreview: true },
      { name: 'Mindfulness', path: '/Mindfulness' },
    ],
  },
];
