# PhytoNova AI

AI-powered agriculture platform for plant disease detection, analytics, and marketplace — built with a sharp, Vercel-inspired dark design that helps farmers and gardeners identify plant diseases, track detections over time, and purchase quality agricultural products.

Live Demo: https://phytonova-ai.vercel.app

## Features

- Disease Detection — AI-powered image analysis using Hugging Face Transformers for accurate plant disease identification
- Dashboard Analytics — Interactive charts and statistics tracking detection history, common diseases, and trends
- Agricultural Marketplace — Full-featured product catalog with search, category filtering, shopping cart, and checkout
- User Authentication — Secure authentication via Supabase with auto-profiles on signup
- Firebase Analytics — Event tracking for page views, detection events, and user interactions
- Responsive Design — Mobile-first responsive UI that works on all devices

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| 3D Graphics | Three.js + React Three Fiber + Spline |
| Backend | Supabase (Auth, Database, Storage) |
| AI Inference | Hugging Face Inference API |
| Email | Resend |
| Charts | Recharts |
| Analytics | Firebase Analytics |
| Icons | React Icons |

## Screenshots

> Coming soon — the following sections will showcase the application UI.

<!-- 
Add screenshots here:
- Hero / Landing Page
- Disease Detection Interface  
- Analytics Dashboard
- Marketplace Browse
- Shopping Cart & Checkout
- Mobile Responsive Views
-->

## Setup

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier)
- A [Hugging Face](https://huggingface.co) account with an inference API token
- A [Firebase](https://console.firebase.google.com) project (for Analytics)
- A [Resend](https://resend.com) account for transactional email (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/PhytoNova-AI.git
cd PhytoNova-AI
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the values in `.env`:

| Variable | Description | Where to Find |
|---|---|---|
| VITE_SUPABASE_URL | Supabase project URL | Supabase Dashboard → Settings → API |
| VITE_SUPABASE_ANON_KEY | Supabase anon/public key | Supabase Dashboard → Settings → API |
| VITE_HF_API_TOKEN | Hugging Face inference token | huggingface.co/settings/tokens |
| VITE_FIREBASE_API_KEY | Firebase web app API key | Firebase Console → Project Settings → Web App |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase auth domain | Firebase Console → Project Settings → Web App |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID | Firebase Console → Project Settings → Web App |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase storage bucket | Firebase Console → Project Settings → Web App |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID | Firebase Console → Project Settings → Web App |
| VITE_FIREBASE_APP_ID | Firebase app ID | Firebase Console → Project Settings → Web App |
| VITE_RESEND_API_KEY | Resend API key (optional) | resend.com/api-keys |

### 3. Initialize Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/001_initial.sql`
4. Paste and run the migration

This creates:
- `profiles` — user profiles (auto-created on signup)
- `detections` — disease scan records
- `products` — marketplace catalog (public read)
- `orders` — purchase records (user-scoped)

All tables have Row Level Security (RLS) policies enforced.

### 4. Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

Output is written to the `dist/` directory.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| VITE_SUPABASE_URL | Yes | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anonymous/public key |
| VITE_HF_API_TOKEN | Yes | Hugging Face API token with inference scope |
| VITE_FIREBASE_API_KEY | Yes | Firebase web app API key |
| VITE_FIREBASE_AUTH_DOMAIN | Yes | Firebase auth domain |
| VITE_FIREBASE_PROJECT_ID | Yes | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Yes | Firebase storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Yes | Firebase messaging sender ID |
| VITE_FIREBASE_APP_ID | Yes | Firebase app ID |
| VITE_RESEND_API_KEY | No | Resend API key for order emails |

## Database Schema

### Profiles Table

| Column | Type | Description |
|---|---|---|
| id | uuid | References auth.users.id |
| full_name | text | User's display name |
| avatar_url | text | Profile picture URL |
| created_at | timestamp | Account creation time |

### Detections Table

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | References profiles.id |
| image_url | text | Stored image path in Supabase Storage |
| disease_label | text | Predicted disease name |
| confidence | decimal | Confidence score (0-1) |
| treatment | text | AI-recommended treatment |
| created_at | timestamp | Detection timestamp |

### Products Table (public read)

| Column | Type | Description |
|---|---|---|
| id | integer | Primary key |
| name | text | Product name |
| category | text | Fertilizers, Seeds, Farming Tools, Plant Care |
| price | integer | Price in INR |
| image | text | Product image URL |
| description | text | Product description |
| rating | decimal | Average rating |

### Orders Table (user-scoped)

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | References profiles.id (nullable for guests) |
| total_price | integer | Order total |
| quantity | integer | Total items |
| status | text | pending, confirmed, shipped, delivered |
| customer_name | text | Delivery contact name |
| customer_email | text | Delivery contact email |
| customer_phone | text | Delivery contact phone |
| customer_address | text | Delivery address |
| cart_items | jsonb | Array of {id, name, price, quantity} |
| created_at | timestamp | Order timestamp |

## Deployment

### Deploy to Vercel

#### Option A — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

#### Option B — GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Vercel dashboard → Settings → Environment Variables
5. Click Deploy

### Post-Deployment Checklist

1. Add your production URL to Supabase **Authentication → URL Configuration → Site URL** and **Redirect URLs**
2. Set `VITE_APP_URL` to your production domain in Vercel environment variables
3. Update `public/robots.txt` and `public/sitemap.xml` with your production domain
4. Enable Firebase Messaging in your Firebase project for push notifications
5. Update the Resend domain configuration if using custom sender domain

## Folder Structure

```
PhytoNova-AI/
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── firebase-messaging-sw.js   # Firebase push notification service worker
├── src/
│   ├── components/
│   │   ├── 3d/                    # React Three Fiber / Spline 3D scenes
│   │   ├── layout/                # Navbar, Footer, Layout, ProtectedRoute
│   │   └── ui/                    # Avatar, Badge, ChartCard, GlassCard, etc.
│   ├── context/
│   │   ├── AuthContext.jsx        # Supabase authentication state
│   │   ├── CartContext.jsx        # Shopping cart with localStorage persistence
│   │   └── ThemeContext.jsx       # Dark mode context
│   ├── data/
│   │   └── products.js            # Static marketplace product catalog
│   ├── hooks/
│   │   └── useAuth.js             # useAuth hook alias
│   ├── pages/
│   │   ├── Auth/                  # AuthPage, LoginForm, RegisterForm
│   │   ├── Dashboard/             # DashboardPage, StatsCards, RecentScans
│   │   ├── Detection/             # DetectionPage, UploadZone, ResultPanel
│   │   ├── Home/                  # HomePage, HeroSection, FeaturesSection
│   │   ├── Marketplace/           # MarketplacePage, ProductCard, ProductDetail
│   │   └── Profile/               # ProfilePage
│   ├── routes/
│   │   └── index.jsx              # Route definitions with lazy loading
│   ├── services/
│   │   ├── aiService.js           # Hugging Face inference wrapper
│   │   ├── api.js                 # Axios instance
│   │   ├── firebase.js            # Firebase Analytics + trackEvent helper
│   │   └── supabase.js            # Supabase client + auth helpers
│   ├── utils/
│   │   ├── a11y.js                # Accessibility helpers
│   │   └── treatments.js          # Disease → treatment mapping data
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/
│       └── 001_initial.sql        # Database schema + RLS policies
├── .env.example
├── vercel.json
├── package.json
└── tailwind.config.js
```

## API & Services

### AI Service (aiService.js)

- `analyzePlantImage(imageFile)` → POST to Hugging Face Inference API
  - Returns: `{ disease: string, confidence: number, treatment: string }`

### Supabase Service (supabase.js)

- `supabase.auth` — User authentication (signup, login, logout, session)
- `supabase.from('profiles')` — User profile CRUD
- `supabase.from('detections')` — Disease detection records
- `supabase.from('products')` — Product catalog (public read)
- `supabase.from('orders')` — Order management
- `supabase.storage` — File uploads for detection images

### Firebase Service (firebase.js)

- `trackEvent(eventName, params)` — Analytics event tracking
  - Events: page_view, disease_detection, add_to_cart, checkout, order_placed

### Email (Resend)

- Order confirmation email sent on successful checkout
- Uses Resend Transactions API for reliable delivery

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) file for details.

## Contact

For questions, suggestions, or collaborations:
- GitHub Issues: https://github.com/your-org/PhytoNova-AI/issues
- Email: support@phytonova.ai

---

Built with care for farmers and gardeners everywhere.