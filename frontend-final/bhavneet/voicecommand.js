import React, { useState } from 'react';

const VoiceCommand = ({ onMoodDetected }) => {
    const [isListening, setIsListening] = useState(false);

    const startRecognition = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.start();

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const mood = event.results[0][0].transcript;
            onMoodDetected(mood);
        };
    };

    return (
        <div>
            <button onClick={startRecognition} disabled={isListening}>
                {isListening ? "Listening..." : "Start Voice Command"}
            </button>
        </div>
    );
};

export default VoiceCommand;
