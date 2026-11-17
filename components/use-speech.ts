"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { acceptsWakeCommand } from "@/lib/voice";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionError = { error: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

type Options = {
  voiceOut: boolean;
  muted: boolean;
  wakeWord: boolean;
  voiceName: string;
  rate: number;
  expectingResponse: boolean;
  onCommand: (text: string) => void;
  onError: (message: string) => void;
};

export function useSpeech(options: Options) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognition = useRef<Recognition | null>(null);
  const latest = useRef(options);
  const lastAnswer = useRef("");
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepListening = useRef(false);
  const active = useRef(false);
  const discardResult = useRef(false);
  const manualStart = useRef(false);

  const resumeWakeWord = useCallback(() => {
    if (!keepListening.current || !latest.current.wakeWord || !recognition.current) return;
    if (restartTimer.current) clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      const rec = recognition.current;
      if (!rec || active.current || !keepListening.current || !latest.current.wakeWord) return;
      try {
        active.current = true;
        manualStart.current = false;
        rec.start();
      } catch (error) {
        active.current = false;
        keepListening.current = false;
        latest.current.onError(`Could not restart voice recognition: ${String(error)}`);
      }
    }, 400);
  }, []);

  useEffect(() => {
    latest.current = options;
  }, [options]);

  useEffect(() => {
    const browser = window as RecognitionWindow;
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) {
      // Browser support can only be checked after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
    } else {
      const rec = new Constructor();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      let finalText = "";
      rec.onstart = () => {
        active.current = true;
        finalText = "";
        setListening(true);
      };
      rec.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interim += result[0].transcript;
        }
        setTranscript(finalText + interim);
      };
      rec.onerror = (event) => {
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          keepListening.current = false;
          latest.current.onError("Microphone blocked. Allow microphone access in browser settings.");
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          keepListening.current = false;
          latest.current.onError(`Voice recognition failed: ${event.error}`);
        }
      };
      rec.onend = () => {
        active.current = false;
        setListening(false);
        const text = finalText.trim();
        finalText = "";
        const manuallyStarted = manualStart.current;
        manualStart.current = false;
        if (discardResult.current) {
          discardResult.current = false;
          return;
        }
        if (text && (!latest.current.wakeWord || manuallyStarted || acceptsWakeCommand(text, latest.current.expectingResponse))) latest.current.onCommand(text);
        else resumeWakeWord();
      };
      recognition.current = rec;
    }

    const synthesis = window.speechSynthesis;
    const loadVoices = () => setVoices(synthesis.getVoices().filter((voice) => voice.lang.startsWith("en")));
    if (synthesis) {
      loadVoices();
      synthesis.addEventListener("voiceschanged", loadVoices);
    }
    return () => {
      keepListening.current = false;
      if (restartTimer.current) clearTimeout(restartTimer.current);
      const rec = recognition.current;
      if (rec) {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      }
      recognition.current = null;
      active.current = false;
      if (synthesis) {
        synthesis.removeEventListener("voiceschanged", loadVoices);
        synthesis.cancel();
      }
    };
  }, [resumeWakeWord]);

  const start = useCallback(() => {
    const rec = recognition.current;
    if (!rec) {
      latest.current.onError("Voice input is unavailable. Type your request instead.");
      return;
    }
    window.speechSynthesis?.cancel();
    keepListening.current = true;
    if (active.current) return;
    try {
      active.current = true;
      manualStart.current = true;
      rec.start();
    } catch (error) {
      active.current = false;
      latest.current.onError(`Could not start voice recognition: ${String(error)}`);
    }
  }, []);

  const stop = useCallback(() => {
    keepListening.current = false;
    if (restartTimer.current) clearTimeout(restartTimer.current);
    if (active.current) recognition.current?.stop();
  }, []);

  const speak = useCallback((text: string) => {
    lastAnswer.current = text;
    const settings = latest.current;
    keepListening.current = settings.wakeWord;
    if (active.current && recognition.current) {
      discardResult.current = true;
      recognition.current.abort();
    }
    if (!settings.voiceOut || settings.muted || !window.speechSynthesis) {
      resumeWakeWord();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.name === settings.voiceName) ?? null;
    utterance.rate = settings.rate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      resumeWakeWord();
    };
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== "interrupted" && event.error !== "canceled") {
        latest.current.onError("Voice output failed.");
      }
      resumeWakeWord();
    };
    window.speechSynthesis.speak(utterance);
  }, [resumeWakeWord]);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    resumeWakeWord();
  }, [resumeWakeWord]);

  return { listening, speaking, transcript, setTranscript, supported, voices, start, stop, speak, cancelSpeech, lastAnswer };
}
