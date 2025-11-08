"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import styles from "@/styles/intro/button.module.css";
import { Smooch_Sans } from "next/font/google";

const smoochSans = Smooch_Sans({ subsets: ["latin"], weight: ["600", "700"] });

export default function IntroButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClick = () => {
    const timeLine = gsap.timeline({ paused: false });

    timeLine
      .to(buttonRef.current, {
        duration: 0.6,
        opacity: 0.9,
        background: "linear-gradient(90deg, #c0c0c0, #000)",
        boxShadow: "0px 0px 20px 5px rgba(192, 192, 192, 0.8)",
      })
      .to(buttonRef.current, {
        duration: 0.8,
        height: 0.2,
        opacity: 0.8,
        background: "linear-gradient(90deg, #c0c0c0, #000)",
        boxShadow: "0px 0px 30px 10px rgba(192, 192, 192, 0.9)",
        fontSize: 0,
        delay: 0.25,
      })
      .to(buttonRef.current, {
        duration: 0.1,
        opacity: 1,
        background: "#000",
      })
      .to(buttonRef.current, 0, {
        width: 2,
        delay: 0.2,
      })
      .to(buttonRef.current, 0.1, {
        boxShadow: "0px 0px 50px 25px rgba(192, 192, 192, 0.7)",
        y: 90,
        height: 100,
        delay: 0.23,
      })
      .to(buttonRef.current, 0.3, {
        height: 1000,
        y: -1500,
        boxShadow: "0px 0px 75px 25px rgba(192, 192, 192, 0.6)",
        background: "linear-gradient(90deg, #000, #c0c0c0)",
        delay: 0.2,
      })
      .then(() => {
        router.push("/play");
      });
  };

  return (
    <div className={styles.brandContainer}>
      <h1 className={styles.brandTitle}>Check Mate 2110</h1>
      <div ref={buttonRef} onClick={handleClick} className={styles.button}>
        <p className={`${smoochSans.className} button-text`}>Play</p>
      </div>
    </div>
  );
}
