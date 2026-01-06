import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraCard from './components/CameraCard';
import OutputPanel from './components/OutputPanel';
import ControlPanel from './components/ControlPanel';

const ISL_SIGNS = [
  'Hello',
  'Thank You',
  'Please',
  'Yes',
  'No',
  'Help',
  'Good Morning',
  'Goodbye',
  'Sorry',
  'Welcome'
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [recognizedSign, setRecognizedSign] = useState('');
  const [convertedSpeech, setConvertedSpeech] = useState('');
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const simulateGestureDetection = () => {
    const randomSign = ISL_SIGNS[Math.floor(Math.random() * ISL_SIGNS.length)];
    setRecognizedSign(randomSign);

    setTimeout(() => {
      setConvertedSpeech(prev => {
        const newText = prev ? `${prev} ${randomSign}` : randomSign;
        return newText;
      });
    }, 500);
  };

  const handleStartDetection = () => {
    setIsDetecting(true);
    detectionIntervalRef.current = window.setInterval(() => {
      simulateGestureDetection();
    }, 3000);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    handleStopDetection();
    setRecognizedSign('');
    setConvertedSpeech('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      <Header darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CameraCard
              darkMode={darkMode}
              isActive={isCameraActive}
              stream={stream}
            />

            <OutputPanel
              darkMode={darkMode}
              recognizedSign={recognizedSign}
              convertedSpeech={convertedSpeech}
            />
          </div>

          <div className="lg:col-span-1">
            <ControlPanel
              darkMode={darkMode}
              isDetecting={isDetecting}
              isCameraActive={isCameraActive}
              onStartDetection={handleStartDetection}
              onStopDetection={handleStopDetection}
              onReset={handleReset}
              onToggleDarkMode={toggleDarkMode}
            />
          </div>
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;
