import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              لقد واجهنا مشكلة فنية أثناء تحميل هذه الصفحة. يرجى محاولة تحديث الصفحة أو العودة إلى لوحة التحكم.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 overflow-x-auto text-left" dir="ltr">
                <p className="text-xs text-red-600 font-mono whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث الصفحة</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors font-medium shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
