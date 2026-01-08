import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraCard from './components/CameraCard';
import OutputPanel from './components/OutputPanel';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';

function App() {
  // State to control view navigation
  const [showLanding, setShowLanding] = useState(true);

  // App Core State
  const [darkMode, setDarkMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [recognizedSign, setRecognizedSign] = useState('');
  const [convertedSpeech, setConvertedSpeech] = useState('');
  
  // Camera Switching State
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Refs for detection loop and image processing
  const detectionIntervalRef = useRef<number | null>(null);
  const processingVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Sync the visible stream with our hidden processing video
  useEffect(() => {
    if (processingVideoRef.current && stream) {
      processingVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async (requestedMode?: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    const modeToUse = requestedMode || facingMode;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: modeToUse,
          width: { ideal: 1280 }, 
          height: { ideal: 720 }
        },
        audio: false
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
    handleStopDetection();
  };

  const handleToggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraActive) {
      startCamera(newMode);
    }
  };

  // --- Backend Integration Logic ---
  const detectFrame = async () => {
    if (!processingVideoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = processingVideoRef.current;
    const canvas = canvasRef.current;

    // Ensure video is playing and has dimensions
    if (video.readyState !== 4) return;

    // Draw current video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and send to backend
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update state with result from Python backend
        if (data.sign) {
          setRecognizedSign(data.sign);
          
          // Simple logic to append speech (debounced)
          setConvertedSpeech(prev => {
            const words = prev.trim().split(' ');
            const lastWord = words[words.length - 1];
            
            // Only append if it's a new word or enough time has passed
            if (lastWord !== data.sign) {
               return prev ? `${prev} ${data.sign}` : data.sign;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Prediction Error:', error);
      }
    }, 'image/jpeg', 0.8); // 0.8 quality to reduce bandwidth
  };

  const handleStartDetection = () => {
    setIsDetecting(true);
    // Poll the backend every 1000ms (1 second)
    // You can lower this to 500ms or 200ms if your backend is fast enough
    detectionIntervalRef.current = window.setInterval(() => {
      detectFrame();
    }, 1000);
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

  if (showLanding) {
    return <LandingPage onGetStarted={() => {
      setShowLanding(false);
      startCamera(); 
    }} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black' 
        : 'bg-gradient-to-br from-teal-50 via-white to-slate-100'
    }`}>
      <Header darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hidden video and canvas for processing frames */}
        <video
          ref={processingVideoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
            <div className="sticky top-24">
              <ControlPanel
                darkMode={darkMode}
                isDetecting={isDetecting}
                isCameraActive={isCameraActive}
                onStartDetection={handleStartDetection}
                onStopDetection={handleStopDetection}
                onReset={handleReset}
                onToggleDarkMode={toggleDarkMode}
                onToggleCamera={handleToggleCamera}
              />
              
              <button 
                onClick={() => {
                  stopCamera();
                  setShowLanding(true);
                }}
                className={`w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;