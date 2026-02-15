import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <span className="text-[140px] font-black text-slate-100 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-2xl font-black text-white">CS</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
