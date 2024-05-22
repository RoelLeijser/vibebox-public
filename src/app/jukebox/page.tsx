"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Image from "next/image";
import angry from "../../../public/faces/angry.gif";
import content from "../../../public/faces/content.gif";
import content2 from "../../../public/faces/content2.gif";
import evil from "../../../public/faces/evil.gif";
import happy from "../../../public/faces/happy.gif";
import neutral from "../../../public/faces/neutral.gif";
import sad from "../../../public/faces/sad.gif";
import stressed from "../../../public/faces/stressed.gif";

import { useEffect, useState } from "react";
import textToSpeech from "../../utils/textToSpeech";
import { pusherClient } from "~/utils/pusher";
interface Sentence {
  text: string;
  background: string;
  face: string;
}
export default function Jukebox() {
  const [face, setFace] = useState(content);
  const [background, setBackground] = useState("#ffffff");
  const [bannerText, setbannerText] = useState(
    "Scan de QR-code om te beginnen",
  );
  const [sentences, setSentences] = useState<Sentence[]>([]);

  const handleAudioFetch = async (text: string) => {
    const data = await textToSpeech(text);
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    return url;
  };

  useEffect(() => {
    const speak = async () => {
      if (sentences.length > 0) {
        const sentence = sentences[0]!;

        // Set the background color
        setBackground(sentence.background);

        // Set the face
        switch (sentence.face) {
          case "angry":
            setFace(angry);
            break;
          case "content":
            setFace(content);
            break;
          case "content2":
            setFace(content2);
            break;
          case "evil":
            setFace(evil);
            break;
          case "happy":
            setFace(happy);
            break;
          case "neutral":
            setFace(neutral);
            break;
          case "sad":
            setFace(sad);
            break;
          case "stressed":
            setFace(stressed);
            break;
        }

        setbannerText(sentence.text);

        try {
          // Make API request to ElevenLabs for text-to-speech
          const audioUrl = await handleAudioFetch(sentence.text);

          // Create an audio element
          const audio = new Audio(audioUrl);

          // Set up event listener for when audio finishes
          audio.addEventListener("ended", () => {
            // Remove the played sentence from the array
            setSentences((prevSentences) => prevSentences.slice(1));
          });

          // Play the audio
          await audio.play();
        } catch (error) {
          console.error("Error fetching audio:", error);
        }
      } else {
        resetContent();
      }
    };

    void speak();
  }, [sentences]);

  const resetContent = () => {
    setFace(content);
    setBackground("#ffffff");
    setbannerText("Scan de QR-code om te beginnen");
  };

  useEffect(() => {
    pusherClient
      .subscribe("jukebox")
      .bind("new-sentence", (data: { sentences: Sentence[] }) => {
        setSentences((prev) => [...prev, ...data.sentences]);
      });
  }, []);

  return (
    <main
      style={{
        background: background,
      }}
      className="flex max-h-screen flex-col items-center justify-center overflow-hidden duration-1000"
    >
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <Image src={face} alt="face" className="h-full w-full" />

        {bannerText.length > 0 && (
          <div className="absolute bottom-28 w-screen bg-slate-800 bg-opacity-50 py-5 text-center">
            <span className="text-6xl text-yellow-50">{bannerText}</span>
          </div>
        )}
      </div>
    </main>
  );
}
