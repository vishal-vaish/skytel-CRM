import React, {useEffect, useState} from "react";
import styles from "./device.module.css";
import VideoScreen from "./videoScreen";
import {toast} from "sonner";
import {FullScreen, useFullScreenHandle} from "react-full-screen";
import requester from "../requester";
import video from "../assets/login_bg.mp4";
import Footer from "./footer.jsx";

const DeviceIdScreen = () => {
  const [isDeviceIdExist, setIsDeviceIdExist] = useState(false);
  const [deviceData, setDeviceData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputField, setInputField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isToHideVideo, setIsToHideVideo] = useState(false);
  const handle = useFullScreenHandle();

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    if (storedDeviceId) {
      setIsDeviceIdExist(true);
      setInputField(storedDeviceId);
    }
  }, [])

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await requester.get(`/sources`, {
        headers: {
          'deviceName': inputField,
        }
      });
      localStorage.setItem("deviceId", inputField);
      setDeviceData(response.data);
      console.log(response.data);
      if (response.data.length === 0) {
        setErrorMessage("No Content Found");
      } else {
        toggleFullScreen();
        setIsDeviceIdExist(true);
        setIsFullScreen(true);
        setIsToHideVideo(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMessage("Device ID not found")
      } else {
        toast.error("Error will sending");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClick = () => {
    setErrorMessage("");
    if (inputField.trim() === "") {
      setErrorMessage("Field cannot be Empty");
      return;
    }
    fetchData();
  }

  const toggleFullScreen = () => {
    if (isFullScreen) {
      handle.exit();
    } else {
      handle.enter();
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleStart = () => {
    fetchData();
  }

  const handleBack = () => {
    localStorage.removeItem("deviceId");
    setIsDeviceIdExist(false);
    setErrorMessage("");
    setInputField("");
  }

  const handleOnError = () => {
    setIsFullScreen(false);
    setErrorMessage("Device ID not found");
    setIsToHideVideo(false);
  }

  return (
    <>
      <FullScreen handle={handle}>
        {isToHideVideo && isDeviceIdExist && isFullScreen &&
          <VideoScreen
            data={deviceData}
            onError={handleOnError}
          />}
        {!isToHideVideo &&
          <div className={styles.deviceScreen}>
            <video className={styles.fullScreenVideo} muted autoPlay loop>
              <source src={video} type="video/mp4"/>
            </video>
            <div className={styles.deviceIdWrapperContainer}>
              {isDeviceIdExist && !isFullScreen && (
                <div>
                  <div className={styles.deviceHeader}>
                    Device Id Name:
                    <div>{localStorage.getItem("deviceId")}</div>
                  </div>
                  {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
                  <div className={styles.buttonContainer}>
                    <button onClick={handleStart} className={styles.button}>Click here to Start</button>
                  </div>
                  <div className={styles.back} onClick={handleBack}>
                    Try Another device Id
                  </div>
                </div>
              )}

              {!isDeviceIdExist && (
                <div>
                  <div className={styles.inputContainer}>
                    <label>Enter the device ID:</label>
                    <input
                      type="text"
                      onChange={(e) => setInputField(e.target.value)}
                      className={styles.inputField}
                      placeholder="Type here..."
                      value={inputField}
                    />
                  </div>
                  {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
                  <div className={styles.buttonContainer}>
                    <button
                      className={styles.button}
                      onClick={handleClick}
                      disabled={isLoading}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Footer/>
          </div>}
      </FullScreen>
    </>
  )
}
export default DeviceIdScreen;
