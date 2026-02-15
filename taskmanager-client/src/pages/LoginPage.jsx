import LoginForm from '../components/auth/LoginForm';
import { CheckCircle, Users, BarChart3, Clock, Brain, Sparkles, Lightbulb, Target } from 'lucide-react';

const features = [
  { icon: Users, text: 'Team Synergy', desc: 'Collaborate mindfully', gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
  { icon: BarChart3, text: 'Insight Analytics', desc: 'Data-driven decisions', gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50' },
  { icon: Lightbulb, text: 'Idea Tracking', desc: 'Capture every thought', gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50' },
  { icon: Target, text: 'Focus Management', desc: 'Prioritize effectively', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50' },
];

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex">
      {/* Left Panel - Cognitive Dark Mode */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-950 to-rose-950 relative overflow-hidden">

        {/* Cognitive Glow Effects - Soft organic shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Mind purple glow */}
          <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
          {/* Thought blue glow */}
          <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-blue-500/15 rounded-full blur-[80px]" />
          {/* Idea yellow glow */}
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[250px] bg-amber-500/20 rounded-full blur-[80px]" />
          {/* Warm coral center */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-rose-500/15 rounded-full blur-[100px]" />
        </div>

        {/* Floating thought bubbles */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-[10%] left-[20%] w-3 h-3 bg-purple-400/40 rounded-full" />
          <div className="absolute top-[20%] left-[70%] w-2 h-2 bg-blue-400/50 rounded-full" />
          <div className="absolute top-[40%] left-[85%] w-4 h-4 bg-amber-400/40 rounded-full" />
          <div className="absolute top-[60%] left-[10%] w-2 h-2 bg-rose-400/50 rounded-full" />
          <div className="absolute top-[75%] left-[50%] w-3 h-3 bg-purple-300/40 rounded-full" />
          <div className="absolute top-[30%] left-[40%] w-2 h-2 bg-cyan-400/40 rounded-full" />
          <div className="absolute top-[85%] left-[80%] w-3 h-3 bg-yellow-400/50 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-rose-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-300/40">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CogniStruct</h1>
                <p className="text-purple-300 text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Cognitive Task Management
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center -mt-8">
            <div className="mb-8">
              <p className="text-rose-400 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Think Better,<br />
                <span className="bg-gradient-to-r from-purple-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                  Work Smarter
                </span>
              </h2>
              <p className="text-slate-300 text-base max-w-md leading-relaxed">
                A human-centered task management platform that adapts to how your
                mind works. Organize thoughts, track progress, achieve clarity.
              </p>
            </div>

            {/* Features Grid - Organic Rounded Cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => (
                <div
                  key={f.text}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all hover:scale-[1.02] group"
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.text}</h3>
                  <p className="text-slate-300 text-xs">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>

      {/* Right Panel - Enhanced Cognitive Background */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50">
          {/* Floating cognitive orbs */}
          <div className="absolute top-[10%] right-[10%] w-32 h-32 bg-gradient-to-br from-purple-200/40 to-violet-300/30 rounded-full blur-2xl" />
          <div className="absolute bottom-[20%] left-[5%] w-40 h-40 bg-gradient-to-br from-rose-200/40 to-pink-300/30 rounded-full blur-2xl" />
          <div className="absolute top-[50%] right-[20%] w-24 h-24 bg-gradient-to-br from-amber-200/50 to-yellow-300/30 rounded-full blur-xl" />
          <div className="absolute bottom-[40%] right-[5%] w-20 h-20 bg-gradient-to-br from-blue-200/40 to-cyan-300/30 rounded-full blur-xl" />

          {/* Neural connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q200,100 400,200 T800,200" stroke="url(#neuralGradient)" strokeWidth="1" fill="none" />
            <path d="M0,400 Q300,300 500,400 T900,350" stroke="url(#neuralGradient)" strokeWidth="1" fill="none" />
            <path d="M100,0 Q150,200 100,400 T150,800" stroke="url(#neuralGradient)" strokeWidth="1" fill="none" />
            <circle cx="200" cy="200" r="3" fill="#a855f7" opacity="0.5" />
            <circle cx="400" cy="350" r="4" fill="#f43f5e" opacity="0.4" />
            <circle cx="300" cy="500" r="3" fill="#f59e0b" opacity="0.5" />
            <circle cx="500" cy="150" r="2" fill="#3b82f6" opacity="0.4" />
          </svg>

          {/* Floating thought particles */}
          <div className="absolute top-[15%] left-[30%] w-2 h-2 bg-purple-400/60 rounded-full animate-pulse" />
          <div className="absolute top-[60%] right-[25%] w-3 h-3 bg-rose-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[25%] left-[40%] w-2 h-2 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[35%] right-[40%] w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-amber-100 via-orange-100 to-rose-200 px-6 py-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-rose-500 to-amber-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">CogniStruct</h1>
              <p className="text-purple-600 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Cognitive Task Management
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Welcome Text */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome Back 
              </h2>
              <p className="text-slate-600 text-sm">
                Ready to focus? Sign in to access your cognitive workspace
              </p>
            </div>

            {/* Login Form Card - Glassmorphism */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-200/30 p-8 border border-white/60 relative z-20">
              <LoginForm />
            </div>

            {/* Cognitive Pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-6 relative z-0">
              {[
                { text: 'Mindful', color: 'from-purple-100/80 to-purple-200/60 text-purple-700 border-purple-300/50' },
                { text: 'Focused', color: 'from-blue-100/80 to-blue-200/60 text-blue-700 border-blue-300/50' },
                { text: 'Creative', color: 'from-amber-100/80 to-amber-200/60 text-amber-700 border-amber-300/50' },
              ].map((tag) => (
                <span key={tag.text} className={`px-3 py-1.5 bg-gradient-to-r ${tag.color} backdrop-blur-sm text-xs font-medium rounded-full border flex items-center gap-1 shadow-sm`}>
                  <Sparkles className="w-3 h-3" /> {tag.text}
                </span>
              ))}
            </div>

            {/* Footer Note */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
