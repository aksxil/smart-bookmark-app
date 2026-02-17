<h1 align="center">🔖 Smart Bookmark App</h1>

<p align="center" style="font-size: 18px;">
  🚀 A secure, real-time, full-stack bookmark manager built with Next.js 16 and Supabase.<br/>
  Designed with production-grade authentication, strict data isolation, and instant multi-tab synchronization.
</p>

<p align="center">
  <a href="https://smart-bookmark-app-theta-umber.vercel.app" target="_blank">
    <strong>🌐 Live Demo</strong>
  </a>
  &nbsp; | &nbsp;
  <a href="https://github.com/aksxil/smart-bookmark-app" target="_blank">
    <strong>📦 GitHub Repository</strong>
  </a>
</p>

<hr/>

<h2>🚀 Tech Stack</h2>
<ul>
  <li><strong>Framework:</strong> ⚡ Next.js 16 (App Router)</li>
  <li><strong>Authentication:</strong> 🔐 Supabase Auth (Google OAuth)</li>
  <li><strong>Database:</strong> 🗄 PostgreSQL (Supabase)</li>
  <li><strong>Real-time:</strong> ⚡ Supabase Realtime Subscriptions</li>
  <li><strong>Styling:</strong> 🎨 Tailwind CSS</li>
  <li><strong>Deployment:</strong> ▲ Vercel</li>
</ul>

<h2>✨ Features</h2>
<ul>
  <li>🔐 Secure Google OAuth authentication</li>
  <li>📌 Add and delete bookmarks instantly</li>
  <li>⚡ Real-time synchronization across multiple tabs</li>
  <li>🛡 Strict Row-Level Security (RLS) for user isolation</li>
  <li>📱 Fully responsive UI</li>
  <li>🚀 Production deployment with environment-safe configuration</li>
</ul>

<h2>🏗 Architecture Overview</h2>

<pre>
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.js
│   ├── dashboard/page.js
│   ├── page.js
│   ├── layout.js
│   └── globals.css
├── utils/supabase.js
├── package.json
└── tailwind.config.js
</pre>

<h2>🧠 Engineering Challenges & Learnings</h2>

<ul>
  <li>
    <strong>⚡ Real-time Synchronization:</strong><br/>
    Configured Supabase Realtime replication and implemented user-filtered subscriptions 
    to ensure only the authenticated user's data updates across multiple tabs without duplication.
  </li>
  <br/>
  <li>
    <strong>🔁 OAuth Redirect Handling (Production Environment):</strong><br/>
    Resolved redirect mismatch issues by dynamically setting 
    <code>window.location.origin</code> and properly configuring Supabase 
    and Google OAuth credentials for both local and production deployments.
  </li>
  <br/>
  <li>
    <strong>🛡 Row-Level Security (RLS) Implementation:</strong><br/>
    Designed and enforced strict database-level policies to guarantee 
    complete user-level data isolation, preventing unauthorized access 
    even if API requests are manipulated.
  </li>
  <br/>
  <li>
    <strong>📦 Supabase Learning Curve:</strong><br/>
    Supabase was new to me when starting this project. I studied the official documentation 
    and watched technical tutorials to understand authentication flow, RLS policies, 
    and realtime subscriptions. This helped me implement a secure and production-ready architecture.
  </li>
</ul>


<h2>🛠️ Getting Started</h2>

<ol>
  <li>
    🧬 Clone the repository:
    <pre><code>git clone https://github.com/aksxil/smart-bookmark-app</code></pre>
  </li>
  <li>
    📦 Install dependencies:
    <pre><code>npm install</code></pre>
  </li>
  <li>
    🔧 Add environment variables in <code>.env.local</code>:
    <pre><code>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</code></pre>
  </li>
  <li>
    🚀 Start development server:
    <pre><code>npm run dev</code></pre>
  </li>
</ol>

<h2>🧪 Testing Real-Time Functionality</h2>

<ol>
  <li>Login in one browser tab</li>
  <li>Open the app in a second tab</li>
  <li>Add or delete a bookmark</li>
  <li>Watch it update instantly without refreshing</li>
</ol>

<h2>👨‍💻 Developer</h2>

<ul>
  <li><strong>Name:</strong> Aakash Nishad</li>
  <li><strong>GitHub:</strong> <a href="https://github.com/aksxil" target="_blank">@aksxil</a></li>
  <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aakash-nishad/" target="_blank">LinkedIn Profile</a></li>
</ul>


