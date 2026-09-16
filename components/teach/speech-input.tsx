'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};

export function SpeechInput({ value, onChange, onSubmit, disabled }: {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  disabled: boolean;
}) {
  const recognition = useRef<Recognition | null>(null);
  const transcript = useRef(value);
  const submitOnEnd = useRef(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const latest = useRef({ onChange, onSubmit });
  latest.current = { onChange, onSubmit };

  useEffect(() => { transcript.current = value; }, [value]);
  useEffect(() => {
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) return;
    setSupported(true);
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = navigator.language || 'en-US';
    instance.continuous = true;
    instance.interimResults = false;
    instance.onresult = event => {
      let next = transcript.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) next += ` ${event.results[i][0].transcript}`;
      }
      transcript.current = next.trim().slice(0, 12_000);
      latest.current.onChange(transcript.current);
    };
    instance.onerror = () => { submitOnEnd.current = false; setListening(false); };
    instance.onend = () => {
      setListening(false);
      if (!submitOnEnd.current) return;
      submitOnEnd.current = false;
      if (transcript.current.trim().length >= 20) latest.current.onSubmit(transcript.current);
    };
    return () => {
      submitOnEnd.current = false;
      instance.onresult = null; instance.onerror = null; instance.onend = null; instance.abort();
    };
  }, []);

  useEffect(() => {
    if (disabled && listening) {
      submitOnEnd.current = false;
      recognition.current?.stop();
    }
  }, [disabled, listening]);

  function toggle() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    try {
      transcript.current = '';
      latest.current.onChange('');
      submitOnEnd.current = true;
      recognition.current?.start();
      setListening(true);
    } catch {
      submitOnEnd.current = false;
    }
  }

  return <button
    type="button"
    className="primary-button w-full"
    disabled={!supported || disabled}
    onClick={toggle}
    aria-label={listening ? 'Finish speaking and get feedback' : 'Speak your explanation'}
    title={supported ? undefined : 'Speech recognition is unavailable in this browser.'}
  >{listening ? <Square size={18}/> : <Mic size={18}/>} {listening ? 'Finish speaking' : 'Speak your explanation'}</button>;
}
