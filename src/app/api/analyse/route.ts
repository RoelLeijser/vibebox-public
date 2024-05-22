import axios from "axios";
import { NextResponse } from "next/server";
import type { AudioFeatures, RecentlyPlayed } from "spotify-types";
import { pusherServer } from "~/utils/pusher";

interface RequestBody {
  user: {
    name: string;
    token: string;
  };
  recentlyPlayed: RecentlyPlayed;
}

interface Sentence {
  text: string;
  background: string; // hex color
  face: string;
}

export async function POST(request: Request) {
  const body: RequestBody = (await request.json()) as RequestBody;

  let sentences: Sentence[] = [];

  sentences.push({
    text: `Hallo ${body.user.name}, ik ben de vibebox. `,
    background: "#ffd700",
    face: "happy",
  });

  sentences.push({
    text: "Dankjewel voor het delen van al je gegevens.",
    background: "#400000",
    face: "evil",
  });

  sentences.push({
    text: "Laten we eens kijken wat ik allemaal over je kan vertellen.",
    background: "#ffd700",
    face: "happy",
  });

  sentences = addArtistRemark(sentences, body);
  sentences = await addEmotionRemark(sentences, body);

  sentences.push({
    text: "Tot de volgende keer. Doei!",
    background: "#ffd700",
    face: "happy",
  });

  // pusher

  await pusherServer.trigger("jukebox", "new-sentence", {
    sentences,
  });

  return NextResponse.json({ message: "OK" }, { status: 200 });
}

function addArtistRemark(sentences: Sentence[], body: RequestBody) {
  const artists: string[] = [];
  artists.push(
    ...body.recentlyPlayed.items.flatMap(
      (item) => item.track.artists?.map((artist) => artist.name),
    ),
  );

  const mostFrequentArtist = artists
    .sort(
      (a, b) =>
        artists.filter((v) => v === a).length -
        artists.filter((v) => v === b).length,
    )
    .pop();

  const amountOfListents = artists.filter(
    (artist) => artist === mostFrequentArtist,
  ).length;

  const possibleRemarks = [
    `Wow dat is een hele hoop ${mostFrequentArtist}, is alles oke?`,
    `Je luistert wel heel vaak naar ${mostFrequentArtist}... echt heel vaak... wow...`,
    `Ik zie dat je veel naar ${mostFrequentArtist} luistert. Wat cool!`,
    `Hm. gek. Hier staat dat je veel naar ${mostFrequentArtist} luistert. Deel je je account met iemand anders?`,
    `Oh, hm, je luistert écht naar ${mostFrequentArtist}? Uniek...`,
    `Ben je vergeten je playlist van repeat te halen? Je luistert namelijk heel veel naar ${mostFrequentArtist}.`,
    `Oh. Oh jeetje! Ik heb slecht nieuws... Volgens mij is je account gehackt! Iemand is namelijk heel veel naar ${mostFrequentArtist} aan het luisteren.`,
  ];

  if (amountOfListents >= 5) {
    sentences.push({
      text: possibleRemarks[
        Math.floor(Math.random() * possibleRemarks.length)
      ]!,
      background: "#ffd700",
      face: "happy",
    });
  } else {
    sentences.push({
      text: `${mostFrequentArtist} is de artiest waar je het meest naar luistert. Dat is ${amountOfListents} keer. Dat is niet zo veel...`,
      background: "#a9a9a9",
      face: "neutral",
    });
  }

  return sentences;
}
interface ResponseData {
  audio_features: AudioFeatures[];
}

async function addEmotionRemark(sentences: Sentence[], body: RequestBody) {
  const trackIds = body.recentlyPlayed.items
    .map((item) => item.track.id)
    .join(",");

  await axios
    .get<ResponseData>(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
      {
        headers: {
          Authorization: `Bearer ${body.user.token}`,
        },
      },
    )
    .then((res) => {
      //remove null values from the array
      res.data.audio_features = res.data.audio_features.filter(
        (audioFeature) => audioFeature !== null,
      );

      const valence =
        res.data.audio_features.reduce((acc, cur) => acc + cur.valence, 0) /
        res.data.audio_features.length;

      const energy =
        res.data.audio_features.reduce((acc, cur) => acc + cur.energy, 0) /
        res.data.audio_features.length;

      const remarkDict: Record<string, string> = {
        blij: "Zo te zien ben je de afgelopen tijd blij geweest. Je muziek keuze is erg vrolijk.",
        enthousiast:
          "Aan je muziek te zien ben je de afgelopen tijd enthousiast geweest.",
        alert:
          "Ik zie dat je muziek keuze de laatste tijd behoorlijk alert is. Ben je altijd zo hyperactief?",
        gespannen:
          "Je muziek keuze laat zien dat je de afgelopen tijd gespannen bent geweest. Ben je altijd zo angstig?",
        boos: "Ik zie dat je muziek keuze de laatste tijd behoorlijk boos is.",
        "van streek":
          "Als ik even kijk naar je muziek, voel jij je de afgelopen tijd nogal van streek. Is je afspeellijst je therapeut of is er iets anders aan de hand?",
        verdrietig:
          "Oei, ik zie dat je muziek keuze de laatste tijd behoorlijk verdrietig is. Is er iets aan de hand?",
        depri: "Je muziek keuze is de laatste tijd behoorlijk deprimerend. ",
        verveeld:
          "Aan je muziek te zien ben je de afgelopen tijd nogal verveeld.",
        kalm: "Je muziek keuze laat zien dat je de afgelopen tijd kalm bent.",
        relaxed:
          "Jouw muzieksmaak laat zien dat je de afgelopen tijd relaxed bent geweest.",
        tevreden:
          "Op basis van je muziek voel jij je de afgelopen tijd tevreden.",
      };

      const emotion = getEmotion(valence, energy);
      sentences.push({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        text:
          remarkDict[emotion] ??
          `Als ik even kijk naar je muziek, voel jij je de afgelopen tijd nogal ${emotion}.`,
        background: getEmotionColor(emotion),
        face: emotionToFace(emotion),
      });
    });

  return sentences;
}

const getQuadrant = (valence: number, energy: number) => {
  if (valence >= 0 && energy >= 0) {
    return 1;
  } else if (valence < 0 && energy >= 0) {
    return 2;
  } else if (valence < 0 && energy < 0) {
    return 3;
  } else if (valence >= 0 && energy < 0) {
    return 4;
  }
};

const getEmotion = (valence: number, energy: number) => {
  const angle = getAngle(valence, energy);
  let mood = "blij";

  if (angle >= 330) {
    mood = "tevreden";
  } else if (angle >= 300) {
    mood = "relaxed";
  } else if (angle >= 270) {
    mood = "kalm";
  } else if (angle >= 240) {
    mood = "verveeld";
  } else if (angle >= 210) {
    mood = "depri";
  } else if (angle >= 180) {
    mood = "verdrietig";
  } else if (angle >= 150) {
    mood = "van streek";
  } else if (angle >= 120) {
    mood = "boos";
  } else if (angle >= 90) {
    mood = "gespannen";
  } else if (angle >= 60) {
    mood = "alert";
  } else if (angle >= 30) {
    mood = "enthousiast";
  } else if (angle >= 0) {
    mood = "blij";
  }

  return mood;
};

const getAngle = (valence: number, energy: number) => {
  const transformedEnergy = energy * 2 - 1;
  const transformedValence = valence * 2 - 1;

  const thetaRad = Math.abs(Math.atan(transformedEnergy / transformedValence));
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const quad = getQuadrant(transformedValence, transformedEnergy);

  switch (quad) {
    case 1:
      return thetaDeg;
    case 2:
      return 180 - thetaDeg;
    case 3:
      return 180 + thetaDeg;
    case 4:
      return 360 - thetaDeg;
    default:
      return 0;
  }
};

const emotionToFace = (emotion: string) => {
  switch (emotion) {
    case "blij":
      return "happy";
    case "enthousiast":
      return "happy";
    case "alert":
      return "stressed";
    case "gespannen":
      return "stressed";
    case "boos":
      return "angry";
    case "van streek":
      return "sad";
    case "verdrietig":
      return "sad";
    case "depri":
      return "sad";
    case "verveeld":
      return "neutral";
    case "kalm":
      return "content2";
    case "relaxed":
      return "content2";
    case "tevreden":
      return "happy";
    default:
      return "neutral";
  }
};

const getEmotionColor = (emotion: string) => {
  switch (emotion) {
    case "blij":
      return "#ffd700";
    case "enthousiast":
      return "#ffd700";
    case "alert":
      return "#ff0000";
    case "gespannen":
      return "#ff0000";
    case "boos":
      return "#ff0000";
    case "van streek":
      return "#ff0000";
    case "verdrietig":
      return "#0000ff";
    case "depri":
      return "#0000ff";
    case "verveeld":
      return "#a9a9a9";
    case "kalm":
      return "#00ff00";
    case "relaxed":
      return "#00ff00";
    case "tevreden":
      return "#ffd700";
    default:
      return "#a9a9a9";
  }
};
