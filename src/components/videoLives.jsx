import React from "react";

const VideoPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <video
        id="playerID_html5_api"
        playsInline
        preload="none"
        className="max-w-full max-h-full"
        tabIndex={-1}
        controls
        src="blob:https://ppdd02.dtfjinikdinbiframe.shop/6866e4bd-c5d0-494e-8b15-7e64895e94bf"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPage;
