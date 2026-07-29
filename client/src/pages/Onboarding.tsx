import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, Lock, Shield, ChevronRight, ArrowLeft } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Press once. Speak freely.",
    body: "There's no timer. No red counter. No judgment. When you're ready, press again. Your voice becomes an echo — preserved in your vault.",
    cta: "Continue",
  },
  {
    icon: Lock,
    title: "Seal a letter for your future self.",
    body: "Record something today and seal it for a month, a year, five years. It cannot be opened before that date. Not even by you. The lock is real.",
    cta: "Continue",
  },
  {
    icon: Shield,
    title: "Private by default.",
    body: "Your voice is encrypted before it leaves your device. No one else can hear it. You can export everything at any time. Your memories, always yours.",
    cta: "Begin",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-8 fade-in">
        <div className="w-16 h-16 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center mx-auto">
          <Icon className="h-7 w-7 text-amber" />
        </div>

        <h1 className="font-serif-display text-2xl lg:text-3xl text-foreground leading-tight">
          {current.title}
        </h1>

        <p className="text-muted-foreground leading-relaxed">
          {current.body}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === step ? "bg-amber w-4" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-border text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-amber/90 hover:bg-amber text-primary-foreground"
            >
              {current.cta}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Link href="/app">
              <Button
                className="bg-amber/90 hover:bg-amber text-primary-foreground"
              >
                {current.cta}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
