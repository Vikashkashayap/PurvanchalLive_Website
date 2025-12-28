import React, { useState } from 'react';

interface HindiKeyboardProps {
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

const HindiKeyboard: React.FC<HindiKeyboardProps> = ({ onKeyPress, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Hindi keyboard layout - QWERTY style mapping
  const keyboardLayout = [
    ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'],
    ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
    ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
    ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श'],
    ['ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ', '्', 'ा', 'ि', 'ी'],
    ['ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ँ', '़'],
  ];

  const numbers = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const punctuation = ['।', ',', '.', '!', '?', '-', '_', '(', ')', '[', ']'];

  const handleKeyClick = (key: string) => {
    onKeyPress(key);
  };

  const handleBackspace = () => {
    onKeyPress('Backspace');
  };

  const handleSpace = () => {
    onKeyPress(' ');
  };

  const handleEnter = () => {
    onKeyPress('\n');
  };

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        disabled={disabled}
      >
        <span>⌨️</span>
        <span>हिंदी कीबोर्ड</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-4xl w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">हिंदी वर्चुअल कीबोर्ड</h3>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Main Hindi letters */}
      <div className="space-y-2 mb-4">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key, keyIndex) => (
              <button
                key={keyIndex}
                type="button"
                onClick={() => handleKeyClick(key)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-lg font-medium transition-colors"
                disabled={disabled}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Numbers */}
      <div className="flex gap-1 justify-center mb-3">
        {numbers.map((num, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleKeyClick(num)}
            className="w-10 h-10 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded text-lg font-medium transition-colors"
            disabled={disabled}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Punctuation */}
      <div className="flex gap-1 justify-center mb-3">
        {punctuation.map((punct, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleKeyClick(punct)}
            className="w-10 h-10 bg-green-100 hover:bg-green-200 border border-green-300 rounded text-lg font-medium transition-colors"
            disabled={disabled}
          >
            {punct}
          </button>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={handleBackspace}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-lg font-medium transition-colors"
          disabled={disabled}
        >
          ← हटाएं
        </button>
        <button
          type="button"
          onClick={handleSpace}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-lg font-medium transition-colors"
          disabled={disabled}
        >
          Space
        </button>
        <button
          type="button"
          onClick={handleEnter}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-lg font-medium transition-colors"
          disabled={disabled}
        >
          Enter
        </button>
      </div>

      <div className="text-center mt-3 text-sm text-gray-600">
        टेक्स्ट इनपुट में क्लिक करके टाइप करें या कीबोर्ड बटन दबाएं
      </div>
    </div>
  );
};

export default HindiKeyboard;
