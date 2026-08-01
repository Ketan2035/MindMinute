import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Mic, Square, Upload, RefreshCw, Activity, Clock, Zap, Target, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

const MINIMUM_RECORDING_TIME = 10; // seconds
const MAXIMUM_RECORDING_TIME = 60; // seconds
const VideoRecorder = ({ topic, onUploadSuccess }) => {
  const [recordingState, setRecordingState] = useState('permissions'); // permissions, ready, recording, recorded
  const [useCamera, setUseCamera] = useState(true);
  
  const [videoBlob, setVideoBlob] = useState(null);
  const [stream, setStream] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(null);
  

  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false); // track recording state for speech restart

  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcriptActive, setTranscriptActive] = useState(false); // is speech recognition running?
  
  const { user, fetchProfile } = useAuthStore();

  // Derived real stats from live transcript
  const wordCount = liveTranscript.trim() ? liveTranscript.trim().split(/\s+/).length : 0;

  const handlePermissions = async (withCamera) => {
    setUseCamera(withCamera);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: withCamera, 
        audio: true 
      });
      setStream(mediaStream);
      setRecordingState('ready');
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access microphone/camera. Please check your browser permissions.");
    }
  };

  const stopMediaTracks = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // --- Robust Speech Recognition ---
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    // Stop any existing instance first
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let newFinalTranscript = '';
      let newInterimTranscript = '';
      
      // event.resultIndex = index of the first NEW result since the last event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinalTranscript += event.results[i][0].transcript + ' ';
        } else {
          newInterimTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (newFinalTranscript) {
        setLiveTranscript(prev => prev + newFinalTranscript);
      }
      setInterimTranscript(newInterimTranscript);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      // On network error or aborted, try to restart if still recording
      if (isRecordingRef.current && e.error !== 'aborted') {
        setTimeout(() => {
          if (isRecordingRef.current) startSpeechRecognition();
        }, 500);
      }
    };

    recognition.onend = () => {
      setTranscriptActive(false);
      // Auto-restart if still recording (Chrome stops after ~60s of silence)
      if (isRecordingRef.current) {
        setTimeout(() => {
          if (isRecordingRef.current) startSpeechRecognition();
        }, 300);
      }
    };

    recognition.onstart = () => {
      setTranscriptActive(true);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch(e) {
      console.warn('Could not start speech recognition:', e);
    }
  }, []);

  const handleStartClick = () => {
    if (!stream) return;
    setCountdown(5);
  };

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    const mimeType = useCamera ? 'video/webm;codecs=vp9,opus' : 'audio/webm';
    
    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType });
    } catch (e) {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: useCamera ? 'video/webm' : 'audio/webm' });
      setVideoBlob(blob);
      setRecordingState('recorded');
      stopMediaTracks();
      // Stop speech recognition
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(_) {}
      }
      setTranscriptActive(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecordingState('recording');
    
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    // Start speech recognition if not already started during countdown
    setLiveTranscript('');
    setInterimTranscript('');
    if (!isRecordingRef.current) {
      isRecordingRef.current = true;
      startSpeechRecognition();
    }
  };

  const stopRecording = () => {
    if (timer < MINIMUM_RECORDING_TIME) return; 
    
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setVideoBlob(null);
    setLiveTranscript('');
    setInterimTranscript('');
    setTimer(0);
    setTranscriptActive(false);
    isRecordingRef.current = false;
    setRecordingState('permissions');
  };

  const handleUpload = async () => {
    if (!videoBlob || !topic?._id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    formData.append('topicId', topic._id);
    formData.append('transcript', liveTranscript.trim()); // send the real transcript
    formData.append('mediaType', useCamera ? 'video' : 'audio');

    try {
      const response = await axios.post('http://localhost:5000/api/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      await fetchProfile();
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload recording. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!liveTranscript.trim() || !topic?._id) return;

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/videos/text-only', 
        { topicId: topic._id, transcript: liveTranscript.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      
      await fetchProfile();
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Text submission failed:', error);
      alert('Failed to submit transcript. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      stopMediaTracks();
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(_) {}
      }
    };
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (useCamera && videoRef.current && stream && (recordingState === 'ready' || recordingState === 'recording')) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, recordingState, useCamera]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const transcriptWords = liveTranscript.trim().split(/\s+/).filter(Boolean);
  // Estimate speaking speed: words / (timer in minutes), min 1 min to avoid division by zero
  const speakingSpeed = timer > 10 ? Math.round((transcriptWords.length / (timer / 60))) : 0;

  // Auto-stop recording when maximum time is reached
  useEffect(() => {
    if (timer >= MAXIMUM_RECORDING_TIME && recordingState === 'recording') {
      stopRecording();
    }
  }, [timer, recordingState]);

  // Countdown timer logic
  useEffect(() => {
    let countdownInterval;
    if (countdown !== null && countdown > 0) {
      // Warm up speech recognition slightly early so it doesn't miss the first word
      if (countdown === 2 && !transcriptActive) {
        isRecordingRef.current = true;
        startSpeechRecognition();
      }
      countdownInterval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      startRecording();
    }
    return () => clearInterval(countdownInterval);
  }, [countdown, transcriptActive]);

  return (
    <div className="flex-1 flex p-6 lg:p-12 items-center justify-center bg-gray-50 min-h-0 pt-16 lg:pt-12">
      <div className="w-full max-w-7xl h-full flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
        
        {/* Left Side: Video & Controls */}
        <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
          
          {/* Permissions Overlay */}
          {recordingState === 'permissions' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Mic size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your studio</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">
                Your speech will be transcribed in real-time and analysed by Gemini AI.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handlePermissions(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  <Camera size={18} />
                  Use Camera
                </button>
                <button 
                  onClick={() => handlePermissions(false)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  <CameraOff size={18} className="text-gray-500" />
                  Microphone Only
                </button>
              </div>
            </div>
          )}

          {/* Active Recording View */}
          {(recordingState === 'ready' || recordingState === 'recording') && (
            <div className="flex-1 flex flex-col min-h-0 relative bg-gray-900">
              
              {/* Status Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-sm font-medium">
                  {recordingState === 'recording' ? (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  )}
                  {formatTime(timer)} / {formatTime(MAXIMUM_RECORDING_TIME)}
                </div>
                {/* Transcript status badge */}
                {recordingState === 'recording' && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${transcriptActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                    {transcriptActive ? (
                      <><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Transcribing</>
                    ) : (
                      <><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span> Listening...</>
                    )}
                  </div>
                )}
              </div>

              {/* Media Feed */}
              {useCamera ? (
                <div className="flex-1 relative min-h-0">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover min-h-0 transition-all duration-700 ${countdown !== null ? 'blur-sm scale-105 brightness-50' : ''}`}
                  />
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <motion.div
                        key={countdown}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.5 }}
                        className="text-white text-8xl font-black drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      >
                        {countdown}
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
                  <div className={`w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center relative shadow-lg transition-all duration-700 ${countdown !== null ? 'opacity-30 blur-sm scale-90' : ''}`}>
                    {recordingState === 'recording' && (
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-40"></div>
                    )}
                    <Mic size={48} className="text-white relative z-10" />
                  </div>
                  {recordingState === 'recording' && (
                    <p className="mt-8 text-indigo-200 font-medium animate-pulse text-sm">
                      Recording in progress...
                    </p>
                  )}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <motion.div
                        key={countdown}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.5 }}
                        className="text-indigo-400 text-8xl font-black drop-shadow-2xl"
                      >
                        {countdown}
                      </motion.div>
                      <p className="text-indigo-300 font-medium mt-4">Get ready to speak</p>
                    </div>
                  )}
                </div>
              )}

              {/* Live Transcript Ticker — shown at bottom of video */}
              {recordingState === 'recording' && (
                <div className="absolute bottom-16 left-0 right-0 px-4 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FileText size={10} /> Live Transcript
                    </p>
                    <p className="text-white text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
                      {liveTranscript || interimTranscript ? (
                        <>{liveTranscript} <span className="text-white/60">{interimTranscript}</span></>
                      ) : (
                        <span className="text-white/40 italic">Start speaking — your words will appear here...</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Bottom Controls Bar */}
              <div className="bg-white p-4 border-t border-gray-200 flex items-center justify-center gap-4 shrink-0">
                {recordingState === 'ready' ? (
                  <button 
                    onClick={handleStartClick}
                    disabled={countdown !== null}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    {countdown !== null ? 'Starting...' : 'Start Recording'}
                  </button>
                ) : (
                  <div className="flex items-center gap-4 w-full justify-center">
                    {/* Waveform */}
                    <div className="flex items-end gap-1 h-6">
                      {[...Array(12)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                          transition={{ repeat: Infinity, duration: 0.3 + Math.random(), ease: "easeInOut" }}
                          className="w-1 bg-indigo-500 rounded-full"
                        />
                      ))}
                    </div>
                    
                    <span className="text-sm font-semibold text-gray-500 ml-2">
                      Keep speaking for {MAXIMUM_RECORDING_TIME - timer} seconds...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review View */}
          {recordingState === 'recorded' && videoBlob && (
            <div className="flex-1 flex flex-col min-h-0 bg-gray-900 relative">
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <span className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
                  Review
                </span>
                {/* Transcript captured indicator */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${liveTranscript.trim() ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {liveTranscript.trim() ? (
                    <><CheckCircle2 size={12} /> {wordCount} words captured</>
                  ) : (
                    <><AlertCircle size={12} /> No transcript — AI analysis may be limited</>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-0">
                {useCamera ? (
                  <video 
                    src={URL.createObjectURL(videoBlob)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl mx-4">
                    <audio 
                      src={URL.createObjectURL(videoBlob)} 
                      controls 
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
                <button 
                  onClick={resetRecording}
                  disabled={uploading}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  <RefreshCw size={16} /> Retake
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70 text-sm shadow-sm"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Uploading & Analysing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Submit Session
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Topic, Live Stats & Transcript Preview */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-0 pr-2 pb-4">
          
          {/* Topic Card */}
          {topic && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-md">
                  Topic
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <Clock size={14} /> Max 1 Min
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{topic.title}</h3>
            </div>
          )}

          {/* Live Stats — real data from transcript */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Live Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Activity size={16} className="text-indigo-500" />
                  Words Spoken
                </div>
                <span className="font-bold text-gray-900">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Zap size={16} className="text-orange-500" />
                  Speaking Speed
                </div>
                <span className="font-bold text-gray-900">{speakingSpeed > 0 ? `${speakingSpeed} wpm` : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Target size={16} className="text-emerald-500" />
                  Transcript Status
                </div>
                <span className={`font-bold text-xs px-2 py-1 rounded-full ${transcriptActive ? 'bg-emerald-100 text-emerald-700' : recordingState === 'recording' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {transcriptActive ? '● Active' : recordingState === 'recording' ? '○ Reconnecting' : '— Idle'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Transcript Preview Card (right panel) */}
          {(recordingState === 'recording' || recordingState === 'recorded') && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" />
                  Your Transcript
                </h4>
                {liveTranscript && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {wordCount} words
                  </span>
                )}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-y-auto min-h-[80px]">
                {liveTranscript || interimTranscript ? (
                  <p className="text-gray-700 text-sm leading-relaxed">{liveTranscript} <span className="opacity-60">{interimTranscript}</span></p>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    {recordingState === 'recording' 
                      ? 'Start speaking — your words will appear here in real time...' 
                      : 'No transcript captured.'}
                  </p>
                )}
              </div>
              {recordingState === 'recorded' && liveTranscript && (
                <p className="text-[10px] text-gray-400 mt-2">
                  ✓ This transcript will be sent to Gemini AI for deep analysis.
                </p>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
