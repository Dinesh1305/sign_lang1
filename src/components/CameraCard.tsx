import { useRef, useEffect } from 'react';
import { Video, VideoOff } from 'lucide-react';

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
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Camera Input
        </h2>
        <div className="flex items-center gap-2">
          {isActive ? (
            <>
              <Video className="w-5 h-5 text-teal-500" />
              <span className="text-sm font-medium text-teal-500">Active</span>
            </>
          ) : (
            <>
              <VideoOff className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Stopped</span>
            </>
          )}
        </div>
      </div>

      <div className={`relative rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} aspect-video`}>
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
        )}
      </div>
    </div>
  );
}
