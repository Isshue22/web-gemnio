import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Download, Play, Pause, Trash2, Sparkles, Wand2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '../utils';

export const SongLab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (waveformRef.current && file) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#3f3f46',
        progressColor: '#10b981',
        cursorColor: '#10b981',
        barWidth: 2,
        barRadius: 3,
        height: 100,
      });

      const url = URL.createObjectURL(file);
      wavesurfer.current.load(url);

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [file]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessedUrl(null);
    }
  };

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      // Initialize Audio Context
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      // Basic Vocal Removal (Center Channel Subtraction)
      // This works by taking Left - Right channels
      const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;

      // Create a splitter to get individual channels
      const splitter = offlineCtx.createChannelSplitter(2);
      const merger = offlineCtx.createChannelMerger(2);
      const inverter = offlineCtx.createGain();
      inverter.gain.value = -1;

      source.connect(splitter);

      // Left - Right = Vocal Reduced (Mono)
      // We'll put this into both channels of the merger
      const leftChannel = offlineCtx.createGain();
      const rightChannel = offlineCtx.createGain();
      
      splitter.connect(leftChannel, 0); // Left
      splitter.connect(rightChannel, 1); // Right
      
      rightChannel.connect(inverter);
      
      const sum = offlineCtx.createGain();
      leftChannel.connect(sum);
      inverter.connect(sum);

      sum.connect(merger, 0, 0); // Left output
      sum.connect(merger, 0, 1); // Right output
      
      merger.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      
      // Convert Buffer to Blob/URL
      const wavBlob = bufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setProcessedUrl(url);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to convert AudioBuffer to WAV
  const bufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([bufferArr], { type: "audio/wav" });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 h-full bg-zinc-950 text-white overflow-y-auto pb-24 sm:pb-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">Song Lab</h1>
        <p className="text-zinc-400 text-sm sm:text-base">Upload songs to generate instrumentals and learn lyrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Upload Area */}
          {!file ? (
            <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-zinc-900 transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Upload className="text-emerald-500 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Upload your song</h3>
              <p className="text-zinc-500 text-center text-xs sm:text-sm max-w-xs">
                Drag and drop your audio file here or click to browse. Supports MP3, WAV, M4A.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-3xl p-5 sm:p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <Music className="text-white w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate">{file.name}</h3>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>

              <div ref={waveformRef} className="mb-6 sm:mb-8" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <button 
                    onClick={() => wavesurfer.current?.playPause()}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 sm:w-6 h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 h-6 fill-current ml-1" />}
                  </button>
                  <div className="text-xs sm:text-sm font-mono text-zinc-500">
                    0:00 / 3:45
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button 
                    onClick={processAudio}
                    disabled={isProcessing || !!processedUrl}
                    className={cn(
                      "flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm",
                      processedUrl 
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 sm:w-5 h-5" />
                        Remove Vocals
                      </>
                    )}
                  </button>

                  {processedUrl && (
                    <a 
                      href={processedUrl} 
                      download="instrumental.wav"
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
                    >
                      <Download className="w-4 h-4 sm:w-5 h-5" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="text-purple-500 w-4 h-4 sm:w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">AI Lyrics Extraction</h4>
              <p className="text-xs sm:text-sm text-zinc-500">Automatically transcribe and translate lyrics into your target language.</p>
            </div>
            <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Music className="text-blue-500 w-4 h-4 sm:w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Karaoke Mode</h4>
              <p className="text-xs sm:text-sm text-zinc-500">Practice singing along with real-time feedback on your pronunciation.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">How it works</h3>
            <div className="space-y-4 sm:space-y-6">
              {[
                { step: '01', title: 'Upload Audio', desc: 'Select any song from your device in MP3 or WAV format.' },
                { step: '02', title: 'AI Processing', desc: 'Our algorithm separates the vocals from the background music.' },
                { step: '03', title: 'Learn & Practice', desc: 'Use the instrumental track for karaoke or language practice.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 sm:gap-4">
                  <span className="text-emerald-500 font-mono font-bold text-sm sm:text-base">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500 p-6 sm:p-8 rounded-3xl text-black">
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Pro Tip</h3>
            <p className="text-xs sm:text-sm font-medium opacity-90">
              Songs with clear, centered vocals work best for our removal algorithm. Try high-quality studio recordings for the best results!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
