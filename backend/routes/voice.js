const express = require("express");
const router = express.Router();
const { processVoiceInput, textToSpeech, speechToText } = require("../services/voiceAgentService");

/**
 * POST /api/voice/process
 * Process voice input (non-WebSocket alternative)
 * Accepts audio file upload and returns transcription + agent response + audio response
 */
router.post("/process", async (req, res) => {
  try {
    const { audio, voiceId } = req.body;

    // Validate audio data
    if (!audio) {
      return res.status(400).json({
        error: "Audio data is required",
      });
    }

    console.log("[Voice API] Received voice processing request");

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audio, "base64");

    // Process the voice input
    const result = await processVoiceInput(audioBuffer, voiceId);

    // Return the result
    res.json({
      transcription: result.transcribedText,
      response: result.responseText,
      audio: result.audioBuffer.toString("base64"),
      agentResponse: result.agentResponse,
    });
  } catch (error) {
    console.error("[Voice API] Processing error:", error);
    res.status(500).json({
      error: "Failed to process voice input",
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/tts
 * Convert text to speech
 */
router.post("/tts", async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Text is required and must be a non-empty string",
      });
    }

    console.log(`[Voice API] TTS request for text: "${text.substring(0, 50)}..."`);

    const audioBuffer = await textToSpeech(text, voiceId);

    res.json({
      audio: audioBuffer.toString("base64"),
      format: "mp3",
    });
  } catch (error) {
    console.error("[Voice API] TTS error:", error);
    res.status(500).json({
      error: "Failed to generate speech",
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/stt
 * Convert speech to text
 */
router.post("/stt", async (req, res) => {
  try {
    const { audio } = req.body;

    if (!audio) {
      return res.status(400).json({
        error: "Audio data is required",
      });
    }

    console.log("[Voice API] STT request received");

    const audioBuffer = Buffer.from(audio, "base64");
    const transcription = await speechToText(audioBuffer);

    res.json({
      transcription,
    });
  } catch (error) {
    console.error("[Voice API] STT error:", error);
    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.message,
    });
  }
});

/**
 * GET /api/voice/health
 * Health check endpoint for voice service
 */
router.get("/health", (req, res) => {
  const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY;
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasTavilyKey = !!process.env.TAVILY_API_KEY;

  res.json({
    status: "ok",
    service: "voice",
    provider: "ElevenLabs (TTS + STT)",
    dependencies: {
      elevenlabs: hasElevenLabsKey ? "configured" : "missing",
      groq: hasGroqKey ? "configured" : "missing",
      tavily: hasTavilyKey ? "configured" : "missing",
    },
  });
});

/**
 * GET /api/voice/voices
 * Get available ElevenLabs voices (optional feature)
 */
router.get("/voices", async (req, res) => {
  try {
    // This would require importing ElevenLabs client
    // For now, return common voice IDs
    res.json({
      voices: [
        { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
        { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
        { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella" },
        { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
        { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
        { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
        { id: "VR6AewLTigWG4xSOukaG", name: "Arnold" },
        { id: "pNInz6obpgDQGcFmaJgB", name: "Adam" },
        { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam" },
      ],
    });
  } catch (error) {
    console.error("[Voice API] Error fetching voices:", error);
    res.status(500).json({
      error: "Failed to fetch voices",
      details: error.message,
    });
  }
});

module.exports = router;
