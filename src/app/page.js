'use client'
import React, { useState, useEffect, useRef } from 'react';

const MusicGame = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState([]);
  const [samples, setSamples] = useState({});
  const audioContextRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext and load saved samples
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    loadSavedSamples();
  }, []);

  const notes = {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23
  };

  const playNote = (frequency) => {
    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  const handleBlockClick = (note) => {
    playNote(notes[note]);
    if (isRecording) {
      setRecording(prev => [...prev, { note, time: audioContextRef.current.currentTime - startTimeRef.current }]);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setRecording([]);
      startTimeRef.current = audioContextRef.current.currentTime;
    }
    setIsRecording(!isRecording);
  };

  const playRecording = () => {
    recording.forEach(event => {
      setTimeout(() => playNote(notes[event.note]), event.time * 1000);
    });
  };

  const saveSample = () => {
    const sampleName = prompt("Enter a name for this sample:");
    if (sampleName) {
      const newSamples = { ...samples, [sampleName]: recording };
      setSamples(newSamples);
      localStorage.setItem('musicSamples', JSON.stringify(newSamples));
    }
  };

  const loadSavedSamples = () => {
    const savedSamples = JSON.parse(localStorage.getItem('musicSamples')) || {};
    setSamples(savedSamples);
  };

  const playSample = (sample) => {
    sample.forEach(event => {
      setTimeout(() => playNote(notes[event.note]), event.time * 1000);
    });
  };

  const deleteSample = (name) => {
    const newSamples = { ...samples };
    delete newSamples[name];
    setSamples(newSamples);
    localStorage.setItem('musicSamples', JSON.stringify(newSamples));
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Simple Music Game with Samples</h1>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.keys(notes).map((note) => (
          <button
            key={note}
            className="w-24 h-24 bg-blue-500 text-white text-2xl flex items-center justify-center rounded"
            onClick={() => handleBlockClick(note)}
          >
            {note}
          </button>
        ))}
      </div>
      <div className="space-x-2 mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={toggleRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={playRecording}
          disabled={recording.length === 0}
        >
          Play Recording
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded"
          onClick={saveSample}
          disabled={recording.length === 0}
        >
          Save Sample
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-2">Saved Samples</h2>
      <div className="w-full max-w-md">
        {Object.entries(samples).map(([name, sample]) => (
          <div key={name} className="flex justify-between items-center bg-white p-2 rounded mb-2">
            <span>{name}</span>
            <div>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                onClick={() => playSample(sample)}
              >
                Play
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => deleteSample(name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicGame;