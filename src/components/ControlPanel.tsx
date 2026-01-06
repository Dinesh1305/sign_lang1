import { Play, Square, RotateCcw, Moon, Sun } from 'lucide-react';

interface ControlPanelProps {
  darkMode: boolean;
  isDetecting: boolean;
  isCameraActive: boolean;
  onStartDetection: () => void;
  onStopDetection: () => void;
  onReset: () => void;
  onToggleDarkMode: () => void;
}

export default function ControlPanel({
  darkMode,
  isDetecting,
  isCameraActive,
  onStartDetection,
  onStopDetection,
  onReset,
  onToggleDarkMode
}: ControlPanelProps) {
  const cardClass = `rounded-2xl shadow-xl p-6 transition-colors duration-300 ${
    darkMode 
      ? 'bg-gray-800/50 border border-gray-700 backdrop-blur-sm' 
      : 'bg-white border border-gray-100'
  }`;

  return (
    <div className={cardClass}>
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Control Center
      </h2>

      <div className="space-y-4">
        <button
          onClick={onStartDetection}
          disabled={isDetecting || !isCameraActive}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
            isDetecting || !isCameraActive
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-400 hover:to-teal-500'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          Start Detection
        </button>

        <button
          onClick={onStopDetection}
          disabled={!isDetecting}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
            !isDetecting
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-400 hover:to-red-500'
          }`}
        >
          <Square className="w-5 h-5 fill-current" />
          Stop Detection
        </button>

        <button
          onClick={onReset}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 border-2 hover:-translate-y-0.5 ${
            darkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset System
        </button>

        <div className={`h-px w-full my-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button
          onClick={onToggleDarkMode}
          className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            darkMode
              ? 'bg-gray-700 text-teal-300 hover:bg-gray-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Appearance</span>
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-sm">{darkMode ? 'Dark' : 'Light'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}