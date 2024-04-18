import React, {useContext, useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {AuthContext} from "../../../contextApi/authContext";
import requester, {baseURL, getHeaders} from "../../../requester";
import {toast} from "sonner";
import styles from "./Repository.module.css";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationPage from "../confirmationPage";
import {useNavigate} from "react-router";
import axios from "axios";

const Repository = ({isOpen, setIsOpen, repository, onSuceess}) => {
  const {accessToken} = useContext(AuthContext);
  const [allMediaList, setAllMediaList] = useState([]);
  const fileInputRef = useRef(null);
  const [mediaLoader, setMediaLoader] = useState(0);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [showDialogBox, setShowDialogBox] = useState(false);
  const [isDeletingRespository, setIsDeletingRespository] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const navigate = useNavigate();

  const getDirectoryById = async () => {
    const headers = getHeaders(accessToken);
    try {
      const response = await requester.get(`/files/${repository.id}`, {headers});
      setAllMediaList(response.data);
    } catch (error) {
      toast.error("Error in getting all media list");
    }
  }

  const getMediaName = (fileName) => {
    return fileName.split("/").pop();
  }

  useEffect(() => {
    if (accessToken) {
      getDirectoryById();
    }

  }, [accessToken])

  const handleClose = () => {
    setIsOpen();
  }

  const renderMediaThumbnail = (media) => {

    if (media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png')) {
      return <img src={media} alt={getMediaName(media)}/>;
    } else if (media.endsWith('.mp4') || media.endsWith('.avi')) {
      return (
        <video
          width="170"
          height="150"
          controls
        >
          <source src={media} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return <div>Unsupported Format</div>;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const acceptedExtensions = ['.png', '.jpg', '.jpeg', '.mp4'];

    if (!file) {
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!acceptedExtensions.includes(`.${fileExtension}`)) {
      toast.error("Please select a valid file type (PNG, JPG, JPEG, MP4)");
      return;
    }
    setIsFileSelected(true);
    setUploadingFile(file);
  }

  const upload = async () => {
    const formData = new FormData();
    formData.append('file', uploadingFile);

    const config = {
      headers: getHeaders(accessToken),
      onUploadProgress: progressEvent => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setMediaLoader(progress);
      }
    };
    setIsMediaLoading(true);

    try {
      await axios.post(`${baseURL}/file/${repository.id}`, formData, config);
      toast.success("File has been uploaded");
      await getDirectoryById();
      setUploadingFile(null);
      setIsFileSelected(false);
    } catch (error) {
      toast.error("Error in Uploading File");
    } finally {
      setIsMediaLoading(false)
      setMediaLoader(0);
    }
  }

  const MediaLoader = ({progress}) => {
    return (
      <div className={styles.imageLoaderContainer}>
        <p className={styles.loaderText}>
          {Math.round(progress) > 0 && <>{`${Math.round(progress)}%`}</>}
        </p>
        <div className={styles.loaderCircle}></div>
      </div>
    );
  };

  const handleDelete = async () => {
    if (isDeletingRespository) {
      try {
        const headers = getHeaders(accessToken);
        await requester.delete(`/directories/${repository.id}`, {headers});
        toast.success("Device has been deleted Successfully");
        setShowDialogBox(false);
        setIsOpen();
        onSuceess();
        navigate("/repositories");
      } catch (error) {
        toast.error("Error in Deleting Repository");
      }
    } else {
      try {
        const headers = getHeaders(accessToken);
        await requester.delete(`/file/${repository.id}?fileName=${selectedMedia}`, {headers});
        toast.success("File has been deleted Successfully");
        setShowDialogBox(false);
        await getDirectoryById();
      } catch (error) {
        toast.error("Error in Deleting Files");
      }
    }
  }

  return (
    <div>
      {showDialogBox && (
        <ConfirmationPage
          isOpen={showDialogBox}
          setIsOpen={() => setShowDialogBox(false)}
          onConfirm={handleDelete}
        />
      )}
      <Dialog open={isOpen} onClose={handleClose} fullWidth={true}>
        <DialogTitle>
          <div className={styles.repositoryHeader}>
            <div>{repository.directoryPath}</div>
            <DeleteIcon
              className={styles.deleteIcon}
              onClick={() => {
                setShowDialogBox(true)
                setIsDeletingRespository(true)
              }}
            />
          </div>
        </DialogTitle>
        <DialogContent>
          <div className={styles.mediaContainer}>
            {allMediaList.map((media) => (
              <div className={styles.mediaBox}>
                {renderMediaThumbnail(media)}
                <div className={styles.mediaFooter}>
                  <div>{getMediaName(media)}</div>
                  <DeleteIcon
                    className={styles.deleteIcon}
                    onClick={() => {
                      setShowDialogBox(true)
                      setSelectedMedia(getMediaName(media))
                    }}
                  />
                </div>
              </div>
            ))}
            <div>
              <div
                className={styles.uploadContainer}
                onClick={!isMediaLoading ? () => fileInputRef.current.click() : () => {
                }}
              >
                {isMediaLoading ?
                  <MediaLoader progress={mediaLoader}/>
                  :
                  <>
                    {isFileSelected ? (
                      <>
                        <span className={styles.fileName}>
                          {uploadingFile?.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <AddIcon className={styles.addIcon}/>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{display: 'none'}}
                      onChange={handleFileChange}
                      accept=".png, .jpg, .jpeg, .mp4"
                    />
                  </>
                }
              </div>
              {isFileSelected && (
                <div className={styles.uploadButton} onClick={upload}>
                  <button disabled={isMediaLoading}>Upload</button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Repository;
