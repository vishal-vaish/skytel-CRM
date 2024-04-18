import styles from "./Repositories.module.css";
import {useContext, useEffect, useState} from "react";
import {AuthContext } from "../../../contextApi/authContext";
import requester, {getHeaders} from "../../../requester";
import {toast} from "sonner";
import FolderIcon from '@mui/icons-material/Folder';
import Repository from "../Repository/Repository";
import Header from "../header";

const Repositories = () => {
  const [directoriesList, setDirectoriesList] = useState([]);
  const {accessToken} = useContext(AuthContext);
  const [newDirectory, setNewDirectory] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialogBox, setShowDialogBox] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState("");

  const getAllDirectory = async () => {
    const headers = getHeaders(accessToken);
    try {
      const response = await requester.get("/directories", {headers});
      setDirectoriesList(response.data);
    } catch (error) {
      toast.error("Error in getting all directory");
    }
  }

  useEffect(() => {
    if (accessToken) {
      getAllDirectory();
    }
  }, [accessToken]);

  const handleClick = async () => {
    setErrorMessage("");
    if (newDirectory.trim() === "") {
      setErrorMessage("Field cannot be Empty");
      return;
    }
    setIsLoading(true);

    try {
      const headers = getHeaders(accessToken);
      await requester.post(`/directories/${newDirectory}`, {}, {headers}
      );
      toast.success("New Directory has been created");
      setNewDirectory("");
      await getAllDirectory();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage("Directory already exists");
      } else {
        toast.error("Error in Creating Directory");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleDirectoryClick = (directory) => {
    setSelectedDirectory(directory);
    setShowDialogBox(true)
  }

  return (
    <>
      {showDialogBox &&
        <Repository
          isOpen={showDialogBox}
          setIsOpen={() => setShowDialogBox(false)}
          repository={selectedDirectory}
          onSuceess={getAllDirectory}
        />
      }
      <div>
        <Header headerText="All Devices"/>
        <div className={styles.repositoryContainer}>
          <div className={styles.ListContainer}>
            {directoriesList.map((directory) => (
              <div
                key={directory.id}
                className={styles.folderContainer}
                onClick={() => handleDirectoryClick(directory)}
              >
                <FolderIcon className={styles.folderIcon}/>
                <div>{directory.directoryPath}</div>
              </div>
            ))}
          </div>
          <div className={styles.repositoryRightContainer}>
            <div className={styles.repositoryHeader}>Create New Repository</div>
            <div className={styles.inputContainer}>
              <label>Enter the Repository Name:</label>
              <input
                type="text"
                onChange={(e) => setNewDirectory(e.target.value)}
                className={styles.inputField}
                placeholder="Type here..."
                value={newDirectory}
              />
            </div>

            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            <div className={styles.buttonContainer}>
            <button className={styles.button} disabled={isLoading} onClick={handleClick}>
              Create
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Repositories;