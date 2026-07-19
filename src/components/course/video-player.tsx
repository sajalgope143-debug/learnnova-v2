"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  videoUrl: string;
  lessonId: string;
  courseId: string;
  initialPosition?: number;
  onProgress?: (percentWatched: number) => void;
}

/**
 * HTML5 video player streaming directly from Cloudflare R2 (public
 * bucket URL) or a signed URL for private content. Reports watch
 * progress to /api/progress every 10 seconds and marks the lesson
 * complete once the viewer reaches 90% watched.
 */
export function VideoPlayer({ videoUrl, lessonId, courseId, initialPosition = 0 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMarkedComplete = useRef(false);
  const lastReportedSecond = useRef(0);

  const saveProgress = useCallback(
    async (currentTime: number, isCompleted: boolean) => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId,
          isCompleted,
          lastPositionSeconds: Math.floor(currentTime),
        }),
      });
    },
    [lessonId, courseId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (initialPosition > 0) {
      video.currentTime = initialPosition;
    }

    function handleTimeUpdate() {
      if (!video) return;
      const current = Math.floor(video.currentTime);

      // Throttle progress saves to once every 10 seconds of playback.
      if (current - lastReportedSecond.current >= 10) {
        lastReportedSecond.current = current;
        saveProgress(video.currentTime, false);
      }

      // Mark complete once 90% watched.
      if (!hasMarkedComplete.current && video.duration && video.currentTime / video.duration >= 0.9) {
        hasMarkedComplete.current = true;
        saveProgress(video.currentTime, true);
      }
    }

    function handleEnded() {
      if (!video) return;
      if (!hasMarkedComplete.current) {
        hasMarkedComplete.current = true;
        saveProgress(video.currentTime, true);
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [initialPosition, saveProgress]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        className="h-full w-full"
        playsInline
      />
    </div>
  );
}
