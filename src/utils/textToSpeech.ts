import axios, { type AxiosRequestConfig } from "axios";
import { env } from "../env";

// Define a function called textToSpeech that takes in a string called inputText as its argument.
const textToSpeech = async (inputText: string) => {
  // Set the ID of the voice to be used.
  const VOICE_ID = "zrHiDhphv9ZnVXBqCLjz";

  // Charlie: IKne3meq5aSn9XLyUdCD
  // Mimi: zrHiDhphv9ZnVXBqCLjz

  // Set options for the API request.
  const options: AxiosRequestConfig = {
    method: "POST",
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      accept: "audio/mpeg", // Set the expected response type to audio/mpeg.
      "content-type": "application/json", // Set the content type to application/json.
      "xi-api-key": env.ELEVENLABS_API_KEY, // Set the API key in the headers.
    },
    data: {
      model_id: "eleven_multilingual_v2",
      text: inputText, // Pass in the inputText as the text to be converted to speech.
    },
    responseType: "arraybuffer", // Set the responseType to arraybuffer to receive binary data as response.
  };

  // Send the API request using Axios and wait for the response.
  const speechDetails = await axios.request(options);

  // Return the binary audio data received from the API response.
  return speechDetails.data as ArrayBuffer;
};

// Export the textToSpeech function as the default export of this module.
export default textToSpeech;
