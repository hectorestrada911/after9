"use client";

import AnimatedTextCycle from "@/components/ui/animated-text-cycle";

export function AnimatedTextCycleDemo() {
  return (
    <div className="max-w-[500px] p-4">
      <h1 className="text-left text-4xl font-light text-muted-foreground">
        Your{" "}
        <AnimatedTextCycle
          words={[
            "business",
            "team",
            "workflow",
            "productivity",
            "projects",
            "analytics",
            "dashboard",
            "platform",
          ]}
          interval={3000}
          className="font-semibold text-foreground"
        />{" "}
        deserves better tools
      </h1>
    </div>
  );
}
