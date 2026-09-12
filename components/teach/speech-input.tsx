'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResult> }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
export function SpeechInput({ value, onChange, disabled }: { value: string; onChange: (text: string) => void; disabled: boolean }) {
  const recognition = useRef<Recognition | null>(null);
  const [supported, setSupported] = useState(false); const [listening, setListening] = useState(false); const [error, setError] = useState('');
  const latest = useRef({ value, onChange }); latest.current = { value, onChange };
  useEffect(() => {
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) return;
    setSupported(true); const instance = new Constructor(); recognition.current = instance;
    instance.lang = navigator.language || 'en-US'; instance.continuous = true; instance.interimResults = false;
    instance.onresult = event => {
      let text = latest.current.value;
      for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) text += ` ${event.results[i][0].transcript}`;
      latest.current.onChange(text.trim().slice(0, 12000));
    };
    instance.onerror = event => { setListening(false); setError(event.error === 'not-allowed' ? 'Microphone permission was denied. You can type instead.' : 'Speech input stopped. Please try again or type below.'); };
    instance.onend = () => setListening(false);
    return () => { instance.onresult = null; instance.onerror = null; instance.onend = null; instance.abort(); };
  }, []);
  useEffect(() => { if (disabled) recognition.current?.stop(); }, [disabled]);
  function toggle() { if (listening) { recognition.current?.stop(); setListening(false); return; } try { setError(''); recognition.current?.start(); setListening(true); } catch { setError('Microphone unavailable. Please type instead.'); } }
  return <div className="flex flex-col gap-2"><button type="button" className="pill-button" disabled={!supported || disabled} onClick={toggle}>{listening ? <Square size={18}/> : <Mic size={18}/>} {listening ? 'Stop dictation' : 'Speak your explanation'}</button><p className="quiet-note" role="status">{listening ? 'Listening — finalized phrases appear below. Stop before reviewing your text.' : supported ? 'Optional dictation uses your browser’s speech service, which may process audio remotely. No audio is saved by Nemorra.' : 'Speech recognition is unavailable here. Type your explanation below.'}</p>{error && <p role="alert" className="text-destructive text-sm">{error}</p>}</div>;
}
