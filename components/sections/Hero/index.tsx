"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  name: string;
  title: string;
}

function AnimatedName({ name }: { name: string }) {
  const [displayedName, setDisplayedName] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        index++;
        setDisplayedName(name.slice(0, index));
        if (index >= name.length) {
          clearInterval(interval);
          setTypingDone(true);
        }
      }, 80);
    }, 300);
    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [name]);
  return (
    <>
      {displayedName}
      <motion.span
        animate={typingDone ? { opacity: 0 } : { opacity: [1, 0, 1] }}
        transition={
          typingDone
            ? { duration: 0.3, delay: 1.5 }
            : { repeat: Infinity, duration: 0.8, ease: "linear" }
        }
        className="ml-1 inline-block"
      >
        |
      </motion.span>
    </>
  );
}

export function Hero({ name, title }: HeroProps) {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center px-4 sm:px-6"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-lg text-muted-foreground">
          {t("greeting")}
        </p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight sm:text-7xl">
          <AnimatedName key={name} name={name} />
        </h1>
        <p className="mt-4 text-2xl font-medium text-primary/80 sm:text-3xl">
          {title}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" nativeButton={false} render={<Link href="/projects" prefetch={true} />}>
            <ArrowRight className="mr-2 h-4 w-4" />
            {t("cta_primary")}
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/contact" prefetch={true} />}>
            <Mail className="mr-2 h-4 w-4" />
            {t("cta_secondary")}
          </Button>
        </div>
      </div>
    </section>
  );
}
