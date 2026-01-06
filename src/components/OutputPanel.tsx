interface OutputPanelProps {
  darkMode: boolean;
  recognizedSign: string;
  convertedSpeech: string;
}

export default function OutputPanel({ darkMode, recognizedSign, convertedSpeech }: OutputPanelProps) {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Detection Output
      </h2>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recognized Sign
          </label>
          <textarea
            readOnly
            value={recognizedSign}
            className={`w-full h-24 px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
            placeholder="Detected gestures will appear here..."
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Converted Speech
          </label>
          <textarea
            readOnly
            value={convertedSpeech}
            className={`w-full h-24 px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
            placeholder="Converted text will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
