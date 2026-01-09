import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CameraCard from './components/CameraCard';
import OutputPanel from './components/OutputPanel';
import ControlPanel from './components/ControlPanel';
import TextToSpeechPanel from './components/TextToSpeechPanel';
import LandingPage from './components/LandingPage';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Camera & ML State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [recognizedSign, setRecognizedSign] = useState('');
  const [convertedSpeech, setConvertedSpeech] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Refs
  const detectionIntervalRef = useRef<number | null>(null);
  const processingVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessing = useRef(false);

  // Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Sync stream
  useEffect(() => {
    if (processingVideoRef.current && stream) {
      processingVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Camera Functions
  const startCamera = async (requestedMode?: 'user' | 'environment') => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    const mode = requestedMode || facingMode;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      alert('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    handleStopDetection();
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraActive) startCamera(newMode);
  };

  // ML Detection Logic
  const detectFrame = async () => {
    if (isProcessing.current || !processingVideoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = processingVideoRef.current;
    if (video.readyState !== 4) return;

    isProcessing.current = true;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { isProcessing.current = false; return; }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async blob => {
      if (!blob) { isProcessing.current = false; return; }
      
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const response = await fetch('http://127.0.0.1:8000/predict', { method: 'POST', body: formData });
        if (!response.ok) return;
        const data = await response.json();
        
        if (data.prediction) {
          setRecognizedSign(data.prediction);
          setConvertedSpeech(prev => {
            const words = prev.trim().split(' ');
            return words[words.length - 1] !== data.prediction 
              ? (prev ? `${prev} ${data.prediction}` : data.prediction) 
              : prev;
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        isProcessing.current = false;
      }
    }, 'image/jpeg', 0.8);
  };

  const handleStartDetection = () => {
    if (isDetecting) return;
    setIsDetecting(true);
    detectionIntervalRef.current = window.setInterval(detectFrame, 100);
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

  // ✅ HANDLER FOR MANUAL TEXT UPDATE
  const handleManualTextTranslated = (original: string, translated: string) => {
    setRecognizedSign(original);
    // Decode the URL encoded string from backend
    try {
        setConvertedSpeech(decodeURIComponent(translated));
    } catch (e) {
        setConvertedSpeech(translated);
    }
  };

  if (showLanding) return <LandingPage onGetStarted={() => { setShowLanding(false); startCamera(); }} />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-teal-50 to-slate-100'}`}>
      <Header darkMode={darkMode} />

      <main className="max-w-7xl mx-auto p-6">
        <video ref={processingVideoRef} style={{ display: 'none' }} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Camera & Output */}
          <div className="lg:col-span-2 space-y-8">
            <CameraCard darkMode={darkMode} isActive={isCameraActive} stream={stream} />
            <OutputPanel darkMode={darkMode} recognizedSign={recognizedSign} convertedSpeech={convertedSpeech} />
          </div>

          {/* RIGHT COLUMN: Controls & Manual Input */}
          <div className="space-y-8">
            {/* Pass the callback to update the main UI when manual text is spoken */}
            <TextToSpeechPanel darkMode={darkMode} onTextTranslated={handleManualTextTranslated} />
            
            <ControlPanel
              darkMode={darkMode}
              isDetecting={isDetecting}
              isCameraActive={isCameraActive}
              onStartDetection={handleStartDetection}
              onStopDetection={handleStopDetection}
              onReset={handleReset}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              onToggleCamera={toggleCamera}
            />
          </div>

        </div>
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;