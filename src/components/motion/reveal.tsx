"use client";

import type { ReactNode } from "react";
import {
  motion,
  stagger,
  useReducedMotion,
} from "motion/react";

type MotionBlockProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({
  children,
  className,
}: MotionBlockProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 18,
              scale: 0.985,
              filter: "blur(6px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: MotionBlockProps) {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        delayChildren: stagger(0.07, {
          startDelay: 0.06,
        }),
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.12,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: MotionBlockProps) {
  const reduceMotion = useReducedMotion();

  const item = {
    hidden: reduceMotion
      ? {}
      : {
          opacity: 0,
          y: 20,
          scale: 0.97,
        },

    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 22,
        mass: 0.7,
      },
    },
  };

  return (
    <motion.div
      variants={item}
      className={className}
    >
      {children}
    </motion.div>
  );
}