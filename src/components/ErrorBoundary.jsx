import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleResetData = () => {
    try {
      localStorage.removeItem('coc_7e_gm_dashboard_state_v1');
      localStorage.removeItem('coc_7e_investigator_state_v1');
      localStorage.removeItem('coc_7e_selected_role');
      localStorage.removeItem('coc_7e_selected_game_system');
    } catch (err) {
      console.error('Failed to clear localStorage', err);
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#141816] text-[#EBE6DB] font-sans">
          <div className="max-w-xl w-full bg-[#1c221f] border border-[#2d3732] rounded-xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h1 className="text-xl font-bold font-serif tracking-wide text-white">Something Went Wrong</h1>
                <p className="text-xs text-stone-400">An unexpected error crashed this component view.</p>
              </div>
            </div>

            <div className="bg-[#121614] border border-[#262f2b] rounded-lg p-3 text-xs font-mono text-red-300 overflow-auto max-h-40">
              <p className="font-semibold">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[11px] text-stone-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#2a342f] hover:bg-[#34413b] text-white border border-[#3b4a43] transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-700/50 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Campaign Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
