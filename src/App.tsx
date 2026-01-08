import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraCard from './components/CameraCard';
import OutputPanel from './components/OutputPanel';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';

function App() {
  // -----------------------------
  // Navigation State
  // -----------------------------
  const [showLanding, setShowLanding] = useState(true);

  // -----------------------------
  // Core App State
  // -----------------------------
  const [darkMode, setDarkMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [recognizedSign, setRecognizedSign] = useState('');
  const [convertedSpeech, setConvertedSpeech] = useState('');

  // -----------------------------
  // Camera State
  // -----------------------------
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // -----------------------------
  // Refs
  // -----------------------------
  const detectionIntervalRef = useRef<number | null>(null);
  const processingVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // ✅ FIX 1: The Busy Lock
  const isProcessing = useRef(false);

  // -----------------------------
  // Cleanup on Unmount
  // -----------------------------
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // -----------------------------
  // Sync stream to hidden video
  // -----------------------------
  useEffect(() => {
    if (processingVideoRef.current && stream) {
      processingVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // -----------------------------
  // Camera Controls
  // -----------------------------
  const startCamera = async (requestedMode?: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    const mode = requestedMode || facingMode;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
      console.log("📷 Camera started successfully");
    } catch (err) {
      console.error('❌ Camera error:', err);
      alert('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
      console.log("📷 Camera stopped");
    }
    handleStopDetection();
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraActive) startCamera(newMode);
  };

  // -----------------------------
  // FRAME DETECTION (CORE FIXED)
  // -----------------------------
  const detectFrame = async () => {
    // ✅ FIX 2: Check if busy
    if (isProcessing.current) {
        // console.log("⚠️ Backend busy - Skipping frame to prevent pile-up");
        return;
    }

    if (
      !processingVideoRef.current ||
      !canvasRef.current ||
      !isCameraActive
    ) return;

    const video = processingVideoRef.current;
    if (video.readyState !== 4) return;

    // ✅ FIX 3: Lock the process
    isProcessing.current = true;
    console.log("🔒 Process Locked. Preparing frame...");

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("❌ Failed to get canvas context");
        isProcessing.current = false; 
        return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async blob => {
      if (!blob) {
        console.error("❌ Error: Canvas failed to generate blob");
        isProcessing.current = false; 
        return;
      }

      console.log(`🚀 Sending frame to backend... (${blob.size} bytes)`);

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const API_URL = 'http://127.0.0.1:8000/predict';
        
        const startTime = performance.now(); // Start timer
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: formData 
        });
        const endTime = performance.now(); // End timer

        console.log(`⏱️ Latency: ${(endTime - startTime).toFixed(2)}ms`);

        if (!response.ok) {
          console.error(`❌ Server Error: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log("✅ Prediction received:", data);

        if (data.prediction) {
          setRecognizedSign(data.prediction);

          setConvertedSpeech(prev => {
            const words = prev.trim().split(' ');
            const last = words[words.length - 1];
            return last !== data.prediction
              ? prev
                ? `${prev} ${data.prediction}`
                : data.prediction
              : prev;
          });
        }
      } catch (err) {
        console.error('🔥 NETWORK ERROR:', err);
      } finally {
          // ✅ FIX 5: CRITICAL - Unlock
          isProcessing.current = false;
          console.log("🔓 Process Unlocked. Ready for next frame.");
      }
    }, 'image/jpeg', 0.8);
  };

  // -----------------------------
  // Detection Controls
  // -----------------------------
  const handleStartDetection = () => {
    if (isDetecting) return;
    
    console.log("▶️ Detection started");
    setIsDetecting(true);

    detectionIntervalRef.current = window.setInterval(
      detectFrame,
      100 
    );
  };

  const handleStopDetection = () => {
    console.log("⏹️ Detection stopped");
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting app state");
    handleStopDetection();
    setRecognizedSign('');
    setConvertedSpeech('');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // -----------------------------
  // Landing Page
  // -----------------------------
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
          startCamera();
        }}
      />
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 to-black'
          : 'bg-gradient-to-br from-teal-50 to-slate-100'
      }`}
    >
      <Header darkMode={darkMode} />

      <main className="max-w-7xl mx-auto p-6">
        {/* Hidden processing elements */}
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

          <ControlPanel
            darkMode={darkMode}
            isDetecting={isDetecting}
            isCameraActive={isCameraActive}
            onStartDetection={handleStartDetection}
            onStopDetection={handleStopDetection}
            onReset={handleReset}
            onToggleDarkMode={toggleDarkMode}
            onToggleCamera={toggleCamera}
          />
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;