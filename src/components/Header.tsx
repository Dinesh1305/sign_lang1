import { Sparkles } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
}

export default function Header({ darkMode }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-teal-500/10' : 'bg-teal-50'}`}>
              <Sparkles className={`w-6 h-6 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
                SignLanguage AI
              </h1>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Real-time Gesture Translation
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}