export type RecordingRitualMode = "vault" | "future_self";

export function getRitualGreeting(hour: number): string {
  if (hour < 5) return "Still awake?";
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  if (hour < 21) return "Good evening.";
  return "It's late.";
}

export function getRitualPrompt(mode: RecordingRitualMode): string {
  return mode === "future_self"
    ? "Speak to the self who will need to hear this later."
    : "One clear memory is enough for today.";
}
