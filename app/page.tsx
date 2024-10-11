"use client";

// import axios from "axios";
import { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { checkMarshmallow } from "./check_marshmallow";

export default function Home() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    judgment: string;
    comment: string;
  }>();
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const capture = useCallback(async () => {
    if (!webcamRef?.current) {
      alert("Failed to capture screenshot.");
      return;
    }
    setIsChecking(true);
    const screenshot = webcamRef?.current?.getScreenshot();

    if (!screenshot) {
      alert("Failed to capture screenshot.");
      return;
    }

    try {
      const res = await checkMarshmallow(screenshot);
      setResult(
        res ?? { judgment: "Failed to check marshmallow.", comment: "" }
      );
      setIsChecking(false);
    } catch (error) {
      console.error(error);
      alert("Failed to check marshmallow.");
      setIsChecking(false);
    }
  }, [webcamRef]);

  const videoConstraints = {
    width: windowSize.width * 0.9,
    aspectRatio: 3 / 4,
    facingMode: "environment",
  };

  // loading screen
  if (isChecking) {
    return (
      <div>
        <h1>Marsh Snap</h1>
        <div className="main">
          <p>Checking...</p>
        </div>
      </div>
    );
  }

  // result screen
  if (result) {
    return (
      <div>
        <h1>Marsh Snap</h1>
        <div className="main">
          <p>判定結果: {result.judgment}</p>
          <p>一言: {result.comment}</p>
          <button
            onClick={() => {
              setResult(undefined);
            }}
          >
            もう一度
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Marsh Snap</h1>
      <div className="main">
        <p>マシュマロの写真を撮って、焼き加減を判定しましょう！</p>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
          className="webcam"
        />

        <button
          onClick={capture}
          style={{
            fontWeight: "bold",
          }}
        >
          判定
        </button>
      </div>
    </div>
  );
}
