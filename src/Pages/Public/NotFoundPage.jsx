import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../Components/Common';
import { FileQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8 text-center">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">404 - Page Not Found</h1>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The page you requested does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
