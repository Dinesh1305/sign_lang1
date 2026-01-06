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
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Controls
      </h2>

      <div className="space-y-3">
        <button
          onClick={onStartDetection}
          disabled={isDetecting || !isCameraActive}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isDetecting || !isCameraActive
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95'
          }`}
        >
          <Play className="w-5 h-5" />
          Start Detection
        </button>

        <button
          onClick={onStopDetection}
          disabled={!isDetecting}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            !isDetecting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
          }`}
        >
          <Square className="w-5 h-5" />
          Stop Detection
        </button>

        <button
          onClick={onReset}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            darkMode
              ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } active:scale-95`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>

        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-3 mt-3`}>
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              darkMode
                ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } active:scale-95`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
