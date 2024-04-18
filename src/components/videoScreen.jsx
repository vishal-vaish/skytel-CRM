import ReactPlayer from "react-player/lazy";
import React, {useEffect, useState} from "react";
import requester from "../requester";
import {toast} from "sonner";
import "../App.css"
import Footer from "./footer";

const VideoScreen = ({data, onError}) => {
  const [start, setStart] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [mediaData, setMediaData] = useState(data);
  const [wakeLock, setWakeLock] = useState(null);

  useEffect(() => {

    if (mediaData.length > 0 && !start) {
      setMediaUrl(mediaData[currentVideoIndex].uri);
      setStart(true);
    }
  }, [mediaData, start, mediaUrl, currentVideoIndex]);

  useEffect(() => {
    if (mediaData.length > 0 && mediaData[currentVideoIndex]) {
      if (mediaData[currentVideoIndex].type === "image") {
        const timer = setTimeout(() => {
          handleVideoEnded();
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [mediaData, currentVideoIndex]);

  const handleVideoEnded = async () => {
    let newIndex = (currentVideoIndex + 1) % mediaData.length;
    setMediaUrl(mediaData[newIndex].uri);
    setCurrentVideoIndex(newIndex);

    if (newIndex === mediaData.length - 1) {
      await fetchData();
    }
  }

  const fetchData = async () => {
    setStart(false);
    try {
      const response = await requester.get(`/sources`, {
        headers: {
          'deviceName': localStorage.getItem("deviceId"),
        }
      });
      setMediaData(response.data);
      console.log("new fetch", response.data);
    } catch (error) {
      console.log(error)
      if (error.response.status === 404) {
        onError();
      } else {
        toast.error("unable to fetch");
      }
    } finally {
      setStart(true);
    }
  }

  const handelError = (error) => {
    console.error("Error occurred while loading or playing the video:", error);
    handleVideoEnded();

  }

  useEffect(() => {
    console.log(mediaData.uri);
  }, [mediaData])

  const handleImageError = () => {
    console.log("image skipped");
    handleVideoEnded();

  }

  useEffect(() => {
    let wakeLockInstance = null;

    if (start) {
      if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen")
          .then((wakeLock) => {
            setWakeLock(wakeLock);
            wakeLockInstance = wakeLock;
          })
          .catch((error) => {
            console.error("Failed to acquire wake lock:", error);
          });
      }
    } else {
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            console.log("Wake lock released");
            setWakeLock(null);
          })
          .catch((error) => {
            console.error("Failed to release wake lock:", error);
          });
      }
    }

    return () => {
      if (wakeLockInstance !== null) {
        wakeLockInstance.release()
          .then(() => {
            console.log("Wake lock released during cleanup");
            setWakeLock(null);
          })
          .catch((error) => {
            console.error("Failed to release wake lock during cleanup:", error);
          });
      }
    };
  }, [start, wakeLock]);


  return (
    <div className="app">
      {start && (
        <>
          {mediaData[currentVideoIndex]?.type === "video" ? (
            <ReactPlayer
              url={mediaUrl}
              playing={true}
              onEnded={handleVideoEnded}
              onError={(e) => handelError(e)}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="image"
              className="image"
              onError={handleImageError}
            />
          )}
        </>
      )}
      <Footer/>
    </div>
  )
}

export default VideoScreen;