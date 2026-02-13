import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, Brain, MessageCircle } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/HealthWidgets";

const sampleConversation = [
  { role: "user" as const, text: "Priya ka weight kitna hai?" },
  { role: "ai" as const, text: "Priya Kumari ka current weight 8.2 kg hai, jo uski age ke liye normal se kam hai. AI risk score 78 hai — severe category mein. Nutrition plan follow karein." },
  { role: "user" as const, text: "Kya karna chahiye?" },
  { role: "ai" as const, text: "1. Dal aur ghee rice mein milayein\n2. Hare patte wali sabzi rozana dein\n3. Ande ya doodh haftey mein 3 baar\n4. Next visit mein weight check karein" },
];

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">Voice Assistant</h2>

      {/* Language Toggle */}
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
          हिंदी
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
          English
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
          भोजपुरी
        </button>
      </div>

      {/* Conversation */}
      <div className="space-y-3 mb-6">
        {sampleConversation.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md"
            }`}>
              {msg.role === "ai" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="w-3.5 h-3.5 text-health-ai" />
                  <span className="text-[10px] font-semibold text-health-ai">AI Assistant</span>
                </div>
              )}
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsListening(!isListening)}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-elevated transition-colors ${
            isListening
              ? "bg-health-severe text-primary-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </motion.button>
        <p className="text-xs text-muted-foreground">
          {isListening ? "Listening... tap to stop" : "Tap to speak"}
        </p>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 h-4 rounded-full bg-health-severe"
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
