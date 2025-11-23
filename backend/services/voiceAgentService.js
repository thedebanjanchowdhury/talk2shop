const { ElevenLabsClient } = require("elevenlabs");
const { chatWithAgent } = require("./chatService");
const { Readable } = require("stream");
require("dotenv").config();

// Initialize ElevenLabs client for both Text-to-Speech and Speech-to-Text
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Default voice ID for ElevenLabs (you can change this to any voice ID)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

/**
 * Convert audio buffer to text using ElevenLabs Speech-to-Text
 * @param {Buffer} audioBuffer - Audio data in supported format (mp3, mp4, mpeg, mpga, m4a, wav, webm)
 * @returns {Promise<string>} Transcribed text
 */
async function speechToText(audioBuffer) {
  try {
    console.log("[Voice Agent] Converting speech to text using ElevenLabs...");
    
    // Create a readable stream from buffer
    const audioStream = Readable.from(audioBuffer);
    
    // Use ElevenLabs Speech-to-Text API
    const transcription = await elevenlabs.speechToText.convert({
      audio: audioStream,
      model_id: "eleven_multilingual_v2", // or "eleven_english_sts_v2" for English only
    });

    const transcribedText = transcription.text || "";
    console.log(`[Voice Agent] Transcription: "${transcribedText}"`);
    return transcribedText;
  } catch (error) {
    console.error("[Voice Agent] Speech-to-text error:", error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Convert text to speech using ElevenLabs
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - ElevenLabs voice ID (optional)
 * @returns {Promise<Buffer>} Audio buffer
 */
async function textToSpeech(text, voiceId = DEFAULT_VOICE_ID) {
  try {
    console.log(`[Voice Agent] Converting text to speech: "${text.substring(0, 50)}..."`);
    
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_monolingual_v1",
    });

    // Convert the audio stream to buffer
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    console.log(`[Voice Agent] Generated audio buffer of size: ${audioBuffer.length} bytes`);
    
    return audioBuffer;
  } catch (error) {
    console.error("[Voice Agent] Text-to-speech error:", error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

/**
 * Process voice input: transcribe, get agent response, and convert to speech
 * @param {Buffer} audioBuffer - Input audio buffer
 * @param {string} voiceId - ElevenLabs voice ID for response (optional)
 * @returns {Promise<{text: string, audioBuffer: Buffer, agentResponse: any}>}
 */
async function processVoiceInput(audioBuffer, voiceId = DEFAULT_VOICE_ID) {
  try {
    // Step 1: Convert speech to text using ElevenLabs
    const transcribedText = await speechToText(audioBuffer);
    
    if (!transcribedText || !transcribedText.trim()) {
      throw new Error("No speech detected in audio");
    }

    // Step 2: Get response from chat agent (reusing existing logic)
    console.log(`[Voice Agent] Processing query with chat agent: "${transcribedText}"`);
    const agentResponse = await chatWithAgent(transcribedText);
    
    if (agentResponse.error) {
      throw new Error(agentResponse.error);
    }

    // Extract text from agent response
    // The agent response structure may vary, adjust based on actual response format
    let responseText = "";
    if (agentResponse.messages && agentResponse.messages.length > 0) {
      const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];
      responseText = lastMessage.content || JSON.stringify(agentResponse);
    } else if (typeof agentResponse === "string") {
      responseText = agentResponse;
    } else {
      responseText = JSON.stringify(agentResponse);
    }

    // Step 3: Convert response text to speech using ElevenLabs
    const responseAudioBuffer = await textToSpeech(responseText, voiceId);

    return {
      transcribedText,
      responseText,
      audioBuffer: responseAudioBuffer,
      agentResponse,
    };
  } catch (error) {
    console.error("[Voice Agent] Processing error:", error);
    throw error;
  }
}

/**
 * Handle WebSocket connection for real-time voice interaction
 * @param {WebSocket} ws - WebSocket connection
 */
function handleVoiceConnection(ws) {
  console.log("[Voice Agent] New WebSocket connection established");
  
  let audioChunks = [];
  let isProcessing = false;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "audio_chunk":
          // Accumulate audio chunks
          if (data.audio) {
            const audioBuffer = Buffer.from(data.audio, "base64");
            audioChunks.push(audioBuffer);
          }
          break;

        case "audio_end":
          // Process accumulated audio
          if (isProcessing) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Already processing a request" 
            }));
            return;
          }

          if (audioChunks.length === 0) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "No audio data received" 
            }));
            return;
          }

          isProcessing = true;
          const fullAudioBuffer = Buffer.concat(audioChunks);
          audioChunks = []; // Clear chunks

          try {
            // Send processing status
            ws.send(JSON.stringify({ type: "processing", message: "Processing your voice input..." }));

            // Process the voice input
            const result = await processVoiceInput(fullAudioBuffer, data.voiceId);

            // Send transcription
            ws.send(JSON.stringify({ 
              type: "transcription", 
              text: result.transcribedText 
            }));

            // Send text response
            ws.send(JSON.stringify({ 
              type: "response", 
              text: result.responseText,
              agentResponse: result.agentResponse
            }));

            // Send audio response
            ws.send(JSON.stringify({ 
              type: "audio_response", 
              audio: result.audioBuffer.toString("base64"),
              format: "mp3"
            }));

            ws.send(JSON.stringify({ type: "complete" }));
          } catch (error) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: error.message 
            }));
          } finally {
            isProcessing = false;
          }
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;

        default:
          ws.send(JSON.stringify({ 
            type: "error", 
            message: `Unknown message type: ${data.type}` 
          }));
      }
    } catch (error) {
      console.error("[Voice Agent] Message handling error:", error);
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Invalid message format" 
      }));
    }
  });

  ws.on("close", () => {
    console.log("[Voice Agent] WebSocket connection closed");
    audioChunks = [];
  });

  ws.on("error", (error) => {
    console.error("[Voice Agent] WebSocket error:", error);
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: "connected", 
    message: "Voice agent ready. Send audio chunks with type 'audio_chunk' and finish with 'audio_end'." 
  }));
}

module.exports = {
  speechToText,
  textToSpeech,
  processVoiceInput,
  handleVoiceConnection,
};
