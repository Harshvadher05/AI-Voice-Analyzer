import React, { useState, useRef, useEffect } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true; //show words before they are finalized.
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
  const [notification, setNotification] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const isListening = useRef(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowInstructions(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  useEffect(() => {
    recognition.onresult = (event) => {
      let interim = ""; //temporarily captured words.
      let final = finalTranscript; //confirmed/finalized words.

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
      if (event?.error) {
        console.error("Speech recognition error:", event.error);
      } else {
        console.error("Unknown speech recognition error.");
      }
    };
  }, [finalTranscript]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const startListening = () => {
    isListening.current = true;
    setTranscript("");
    setFinalTranscript("");
    setFrequency({});
    setTimer(0);
    const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
    setIntervalId(id);
    recognition.start();
    showNotification("🎙️ Listening started...");
  };

  const stopListening = () => {
    if (isListening.current) {
      isListening.current = false;
      recognition.stop();
      clearInterval(intervalId);
      setFrequency(getWordFrequency(finalTranscript));
      showNotification("🛑 Listening stopped.");
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
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-md shadow-md border border-green-500 z-50">
          <div className="text-sm font-medium">{notification}</div>
          <div className="mt-2 h-1 bg-green-500 animate-progress-bar rounded-full"></div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="flex flex-col justify-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg max-w-md w-[90%] shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Welcome to AI Voice Analyzer
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed">
              <li>
                Click <strong>Start Listening</strong> to begin recording.
              </li>
              <li>Speak clearly and watch real-time transcription.</li>
              <li>
                Click <strong>Stop Listening</strong> to analyze the speech.
              </li>
              <li>Check the word frequency report below.</li>
              <li>
                Use the <strong>Download Report</strong> button to save your
                analysis.
              </li>
              <li>Toggle dark/light theme anytime from the top right.</li>
            </ul>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/VA logo.png"
              alt="Logo"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              AI Voice Analyzer
            </h1>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 rounded border text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 border-gray-300 text-gray-800"
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
          <h2 className="text-xl font-semibold mb-2">Transcript</h2>
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

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Word Frequency</h2>
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

        {/* Section for upcoming features */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming Features.....</h2>
          <ol
            className={`p-4 rounded-lg shadow text-sm sm:text-base list-decimal list-inside ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            <li>Multy language support.</li>
            <li>Chatboard with voice assistance.</li>
            <li>Text translation.</li>
          </ol>
        </section>

        {/* Project Advertisement Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            🚀 Check Out My Other Project
          </h2>
          <div
            className={`p-6 rounded-lg shadow flex flex-col sm:flex-row items-center gap-6 transition hover:shadow-lg ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            {/* Logo from public folder */}
            <img
              src="/double-slash-icon.png"
              alt="Double Slash Extension Logo"
              className="w-16 h-16 sm:w-20 sm:h-20"
            />

            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                🔍 Double Slash (//) Chrome Extension
              </h3>
              <p className="text-sm leading-relaxed mb-2">
                A lightweight Chrome extension inspired by Grammarly’s inline
                behavior. Type <code>//your query</code>, hit{" "}
                <strong>Enter</strong>, and it automatically fetches results
                from the web directly into your text box.
              </p>
              <ul className="list-disc list-inside text-sm mb-3 space-y-1">
                <li>⚡ Fast & lightweight</li>
                <li>🌐 Uses DuckDuckGo & Wikipedia</li>
                <li>
                  🔦 Highlights text after <code>//</code>
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/Harshvadher05/double-Slash",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:brightness-110 transition text-sm"
                >
                  View on GitHub →
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://my-portfolio-tau-three-vshh9ydsb4.vercel.app/",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded shadow hover:brightness-110 transition text-sm"
                >
                  Visit My Portfolio 🌐
                </button>
              </div>
            </div>
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
          Made by <span className="font-semibold">H.N.Vadher</span>
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} AI Voice Analyzer. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
