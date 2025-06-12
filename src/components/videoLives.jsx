import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css"; // Video.js default skin

const VideoPage = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        responsive: true,
        fluid: true,
        sources: [
          {
            src: "https://ppdd02.dtfjinikdinbiframe.shop/6866e4bd-c5d0-494e-8b15-7e64895e94bf",
            type: "video/mp4" // adjust type if necessary
          }
        ]
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div data-vjs-player className="w-full max-w-4xl">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin"
          playsInline
        />
      </div>
    </div>
  );
};

export default VideoPage;
