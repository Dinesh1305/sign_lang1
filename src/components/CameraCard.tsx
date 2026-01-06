import { useRef, useEffect } from 'react';
import { Video, VideoOff, Radio } from 'lucide-react';

interface CameraCardProps {
  darkMode: boolean;
  isActive: boolean;
  stream: MediaStream | null;
}

export default function CameraCard({ darkMode, isActive, stream }: CameraCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/50 border border-gray-700' 
        : 'bg-white border border-gray-100'
    }`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          <Video className="w-5 h-5 text-teal-500" />
          Live Feed
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
          isActive 
            ? 'bg-teal-500/10 text-teal-500' 
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {isActive && <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>}
          {isActive ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="p-4">
        <div className={`relative rounded-xl overflow-hidden aspect-video shadow-inner ${
          darkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
          {isActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-[1.01]" // Slight scale to remove borders
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <VideoOff className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Camera is currently inactive
              </p>
            </div>
          )}
          
          {/* Overlay grid for tech feel */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none opacity-20" 
              style={{ backgroundImage: `linear-gradient(${darkMode ? '#333' : '#ddd'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#333' : '#ddd'} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}