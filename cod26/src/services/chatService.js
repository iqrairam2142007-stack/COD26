import insforge, { unwrap } from "../lib/insforge";

/**
 * The OpenRouter key never reaches the browser - the `chat` edge function
 * holds it, enforces the per-user rate limit, and writes the transcript.
 */
const chatService = {
  async history() {
    const data = unwrap(
      await insforge.functions.invoke("chat", { body: { action: "history" } })
    );
    return data.messages || [];
  },

  async send(message) {
    const data = unwrap(
      await insforge.functions.invoke("chat", { body: { action: "send", message } })
    );
    return data.reply;
  },
};

export default chatService;
