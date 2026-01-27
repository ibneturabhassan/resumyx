import React from 'react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                R
              </div>
              <span className="text-xl font-bold text-slate-900">Resumyx</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToAuth('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigateToAuth('register')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6 border border-blue-100">
              <i className="fas fa-sparkles"></i>
              <span>AI-Powered Resume Tailoring</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Land Your Dream Job with
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> AI-Optimized </span>
              Resumes
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your resume in seconds with advanced AI. Tailor your experience for any job description, boost your ATS score, and stand out from the competition.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => onNavigateToAuth('register')}
                className="px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                <span>Start Tailoring Free</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <i className="fas fa-play-circle"></i>
                <span>See How It Works</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Multi-AI support</span>
              </div>
            </div>
          </div>

          {/* Preview Image/Screenshot Placeholder */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 text-center text-xs text-slate-500 font-medium">resumyx.app</div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <i className="fas fa-wand-magic-sparkles text-6xl text-blue-600"></i>
                  <p className="text-slate-600 text-lg font-medium">AI Resume Builder Interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features for Job Seekers</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to create a winning resume that gets past ATS systems and impresses recruiters
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-wand-magic-sparkles text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered Tailoring</h3>
              <p className="text-slate-600">
                Automatically optimize your resume for any job description using advanced AI. Highlight the most relevant skills and experiences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">ATS Score Analysis</h3>
              <p className="text-slate-600">
                Get detailed ATS compatibility scores with breakdowns for keywords, formatting, experience relevance, and skills alignment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                <i className="fas fa-filter text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Skills Filtering</h3>
              <p className="text-slate-600">
                AI selects only the most relevant skills from your profile that match the job requirements, removing irrelevant ones.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Parallel Processing</h3>
              <p className="text-slate-600">
                Lightning-fast resume generation with parallel AI processing. Get results in 3-5 seconds instead of 10-15 seconds.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Multi-AI Provider Support</h3>
              <p className="text-slate-600">
                Choose from Gemini, OpenAI, or OpenRouter. Use your own API keys for unlimited generations with any provider.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
                <i className="fas fa-file-pdf text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Perfect PDF Export</h3>
              <p className="text-slate-600">
                Generate high-quality, ATS-friendly PDFs with perfect text rendering and searchable content using native browser technology.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                <i className="fas fa-file-lines text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Cover Letters</h3>
              <p className="text-slate-600">
                Generate personalized, compelling cover letters tailored to each job application in seconds with AI assistance.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mb-4">
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Batch Processing</h3>
              <p className="text-slate-600">
                Tailor your resume for multiple job descriptions simultaneously. Process up to 5 jobs in parallel to save time.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-4">
                <i className="fas fa-shield-check text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Hallucination Detection</h3>
              <p className="text-slate-600">
                Built-in verification ensures AI never fabricates information. Your achievements remain truthful and verifiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Transform your resume in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Create Your Profile</h3>
              <p className="text-slate-600">
                Add your work experience, skills, education, and projects. Your data is securely stored and synced across devices.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Paste Job Description</h3>
              <p className="text-slate-600">
                Copy and paste any job description you're interested in. Our AI analyzes the requirements and keywords instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Tailored Resume</h3>
              <p className="text-slate-600">
                AI optimizes your resume in seconds. Download as PDF and apply with confidence knowing your resume is perfectly matched.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 inline-flex items-center gap-2"
            >
              <span>Start Creating Now</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose Resumyx?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Save Hours of Work</h3>
                    <p className="text-slate-600">Stop manually tweaking your resume for each job. AI does it in seconds with better results.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Beat ATS Systems</h3>
                    <p className="text-slate-600">Our AI knows what ATS systems look for. Get detailed scores and feedback to ensure your resume gets seen.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Smart Keyword Matching</h3>
                    <p className="text-slate-600">AI extracts key requirements from job postings and highlights your most relevant experiences automatically.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Your Data, Your Control</h3>
                    <p className="text-slate-600">Use your own AI API keys. Your resume data is encrypted and never used to train AI models.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 border border-slate-200">
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <i className="fas fa-star"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">85% → 94%</div>
                      <div className="text-sm text-slate-600">ATS Score Improvement</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Average score increase after using Resumyx AI tailoring</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">3-5 seconds</div>
                      <div className="text-sm text-slate-600">Processing Time</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Lightning-fast results with parallel AI processing</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      <i className="fas fa-infinity"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Unlimited</div>
                      <div className="text-sm text-slate-600">Resume Generations</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">No limits when you use your own API keys</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">$0</div>
                <p className="text-slate-600">Perfect to get started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">3 AI resume generations/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Basic ATS scoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">PDF export</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">1 AI cover letter/month</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigateToAuth('register')}
                className="w-full py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 border-2 border-blue-500 shadow-xl transform scale-105">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  RECOMMENDED
                </div>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Bring Your Own Key</h3>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-blue-100">Use your own AI API keys</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Unlimited AI generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Advanced ATS scoring with breakdown</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Batch processing (5 jobs)</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Unlimited cover letters</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Choose any AI provider</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-300 mt-1"></i>
                  <span className="text-white">Priority processing</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigateToAuth('register')}
                className="w-full py-3 text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-md"
              >
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">Custom</div>
                <p className="text-slate-600">For teams and organizations</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Everything in BYOK</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Team collaboration</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Custom branding</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-emerald-500 mt-1"></i>
                  <span className="text-slate-600">Custom integrations</span>
                </li>
              </ul>
              <button className="w-full py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of job seekers who are getting more interviews with AI-optimized resumes
          </p>
          <button
            onClick={() => onNavigateToAuth('register')}
            className="px-10 py-5 text-lg font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 active:scale-95 inline-flex items-center gap-3"
          >
            <span>Start Creating Your Resume</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • Free forever plan • Get started in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  R
                </div>
                <span className="text-lg font-bold text-white">Resumyx</span>
              </div>
              <p className="text-sm">
                AI-powered resume builder that helps you land your dream job faster.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 Resumyx. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
