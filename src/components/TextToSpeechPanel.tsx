import { useState } from 'react';
import { Mic, Send, Keyboard } from 'lucide-react';

interface TextToSpeechPanelProps {
  darkMode: boolean;
  onTextTranslated?: (original: string, translated: string) => void; // ✅ ADDED PROP
}

export default function TextToSpeechPanel({ darkMode, onTextTranslated }: TextToSpeechPanelProps) {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('Hindi');
  const [loading, setLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });

      if (response.ok) {
        // ✅ Get the safe header
        const safeHeader = response.headers.get('X-Translated-Text');
        
        // Update main UI if callback exists
        if (onTextTranslated && safeHeader) {
            onTextTranslated(text, safeHeader);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        new Audio(audioUrl).play();
      }
    } catch (err) {
      console.error(err);
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-xl p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-100'
    }`}>
      <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        <Keyboard className="w-5 h-5 text-teal-500" />
        Manual TTS
      </h2>

      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here..."
          className={`w-full h-24 p-3 rounded-xl resize-none border focus:ring-2 focus:ring-teal-500 outline-none ${
            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}
        />

        <div className="flex gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-lg border outline-none ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            {['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'English'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button
            onClick={handleSpeak}
            disabled={loading || !text}
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${
              loading ? 'bg-gray-400' : 'bg-gradient-to-r from-teal-500 to-blue-600'
            }`}
          >
            {loading ? '...' : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}