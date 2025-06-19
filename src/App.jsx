import React, { useState, useRef, useEffect } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

function getWordFrequency(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g);
  const frequency = {};
  if (!words) return frequency;
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  return frequency;
}

function App() {
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [frequency, setFrequency] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const isListening = useRef(false);

  useEffect(() => {
    recognition.onresult = (event) => {
      let interim = "";
      let final = finalTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptChunk + " ";
        } else {
          interim += transcriptChunk;
        }
      }

      setFinalTranscript(final);
      setTranscript(final + interim);
    };

    recognition.onspeechend = () => {
      stopListening();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  }, [finalTranscript]);

  const startListening = () => {
    isListening.current = true;
    setTranscript("");
    setFinalTranscript("");
    setFrequency({});
    setTimer(0);
    const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
    setIntervalId(id);
    recognition.start();
  };

  const stopListening = () => {
    if (isListening.current) {
      isListening.current = false;
      recognition.stop();
      clearInterval(intervalId);
      setFrequency(getWordFrequency(finalTranscript));
    }
  };

  const downloadReport = () => {
    const report =
      `Transcript:\n${finalTranscript.trim()}\n\nWord Frequency:\n` +
      Object.entries(frequency)
        .map(([word, count]) => `${word}: ${count}`)
        .join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voice-analysis.txt";
    link.click();
  };

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <main className="flex-grow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            🧠 AI Voice Analyzer
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 rounded border text-sm font-medium transition-colors duration-200
              bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 border-gray-300 text-gray-800"
          >
            {isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 items-start sm:items-center">
          <button
            onClick={startListening}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-5 py-2 rounded-lg shadow hover:brightness-110 transition w-full sm:w-auto"
          >
            Start Listening
          </button>
          <button
            onClick={stopListening}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-5 py-2 rounded-lg shadow hover:brightness-110 transition w-full sm:w-auto"
          >
            Stop Listening
          </button>
          <button
            onClick={downloadReport}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:brightness-110 transition w-full sm:w-auto"
          >
            Download Report
          </button>
          <span className="sm:ml-auto font-semibold text-sm mt-2 sm:mt-0">
            ⏱ Time: {timer}s
          </span>
        </div>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">📝 Transcript</h2>
          <div
            className={`p-4 rounded-lg shadow text-sm sm:text-base ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            } min-h-[120px] whitespace-pre-wrap`}
          >
            {transcript.trim() || "No transcript yet."}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">📊 Word Frequency</h2>
          <div
            className={`p-4 rounded-lg shadow text-sm sm:text-base ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            {Object.keys(frequency).length === 0 ? (
              <p>No words analyzed yet.</p>
            ) : (
              <ul className="space-y-1">
                {Object.entries(frequency).map(([word, count]) => (
                  <li
                    key={word}
                    className="border-b border-gray-300 dark:border-gray-600 pb-1"
                  >
                    {word}: {count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer
        className={`border-t pt-4 pb-6 text-center text-sm ${
          isDarkMode
            ? "border-gray-700 text-gray-400"
            : "border-gray-300 text-gray-600"
        }`}
      >
        <p>
          Made with 💡 by <span className="font-semibold">H.N.Vadher</span>
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} AI Voice Analyzer. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
