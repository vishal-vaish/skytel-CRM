import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {toast} from "sonner";
import styles from "./ProvisionScreen.module.css";
import {AuthContext} from "../../../contextApi/authContext";
import requester, {baseURL, getHeaders} from "../../../requester";
import Header from "../header";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Multiselect} from "multiselect-react-dropdown";
import ConfirmationPage from "../confirmationPage";
import cookies from "js-cookie";
import "./ProvisionMultiSelect.css";

const ProvisionScreen = () => {
  const [inputField, setInputField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [directories, setDirectories] = useState([]);
  const [selectedDirectories, setSelectedDirectories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {accessToken, setAccessToken} = useContext(AuthContext);
  const [deviceId, setDeviceId] = useState([]);
  const [multiselectKey, setMultiselectKey] = useState(0);
  const [showDialogBox, setShowDialogBox] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [isUpdatingOpen, setIsUpdatingOpen] = useState(false);

  const getAllDevice = async () => {
    const headers = getHeaders(accessToken);
    try {
      const response = await requester.get("/devices", {headers});
      setDeviceId(response.data);
    } catch (error) {
      toast.error("Error in getting all device");
    }
  }

  useEffect(() => {
    setAccessToken(cookies.get("hostingAccessToken"));
  }, []);

  useEffect(() => {
    const getAllDirectory = async () => {
      const headers = getHeaders(accessToken);
      try {
        const response = await requester.get("/directories", {headers});
        setDirectories(response.data);
      } catch (error) {
        toast.error("Error in getting all directory");
      }
    }

    if (accessToken) {
      getAllDirectory();
      getAllDevice();
    }
  }, [accessToken])

  const handleClick = async () => {
    setErrorMessage("");
    if (inputField.trim() === "" || selectedDirectories.length === 0) {
      setErrorMessage("Field cannot be Empty");
      return;
    }
    setIsLoading(true);

    const directoryIds = selectedDirectories.map(directory => directory.id);

    const createRequestBody = {
      deviceName: inputField,
      directoryIds: directoryIds,
    }

    try {
      const headers = getHeaders(accessToken);
      !isUpdatingOpen
        ? await axios.post(`${baseURL}/devices`, createRequestBody, {headers})
        : await axios.patch(`${baseURL}/devices/${selectedDevice}`, createRequestBody, {headers})


      !isUpdatingOpen
        ? toast.success("Create new Device")
        : toast.success("Updated the Device")
      setInputField("");
      setSelectedDirectories([]);
      setSelectedDevice("");
      setMultiselectKey(prevKey => prevKey + 1);
      !isUpdatingOpen ? setIsUpdatingOpen(true) : setIsUpdatingOpen(false)
      await getAllDevice();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage("Device ID already exists");
      } else {
        toast.error("Error in Creating");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditClick = (device) => {
    setInputField(device.deviceName)
    setSelectedDirectories(device.directories)
    setIsUpdatingOpen(true);
    setSelectedDevice(device.id)
  }

  const handleDelete = async () => {
    if (!selectedDevice) return;
    try {
      const headers = getHeaders(accessToken);
      await axios.delete(`${baseURL}/devices/${selectedDevice}`, {headers});
      toast.success("Device has been deleted Successfully");
      setSelectedDevice("");
      await getAllDevice();
      setShowDialogBox(false);
    } catch (error) {
      toast.error("Error in Deleting device");
    }
  }

  const handleReset = () => {
    setIsUpdatingOpen(false);
    setInputField("");
    setSelectedDirectories([]);
    setMultiselectKey(prevKey => prevKey + 1);
  }

  return (
    <>
      {showDialogBox && (
        <ConfirmationPage
          isOpen={showDialogBox}
          setIsOpen={() => setShowDialogBox(false)}
          onConfirm={handleDelete}
        />
      )}
      <div className={styles.provisionContainer}>
        <Header headerText="All Repositories"/>
        <div className={styles.provisionWrapperContainer}>
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Device Id</div>
              <div className={styles.headerCell}>Repositories</div>
              <div className={styles.headerCell}>Action</div>
            </div>
            <div className={styles.bodyContainer}>
              {deviceId?.map((device, index) => (
                <div key={index} className={styles.rowDiv}>
                  <div className={styles.cellDiv}>{device.deviceName}</div>
                  <div className={styles.cellDiv}>
                    {device.directories.map(directory => <div>{directory.directoryPath}</div>)}
                  </div>
                  <div className={styles.cellDiv}>
                    <div className={styles.icon}>
                      <EditIcon
                        className={styles.editIcon}
                        onClick={() => handleEditClick(device)}
                      />
                      <DeleteIcon
                        className={styles.deleteIcon}
                        onClick={() => {
                          setShowDialogBox(true)
                          setSelectedDevice(device.id);
                        }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.provisionRightContainer}>
            <div className={styles.provisionHeader}>
              {isUpdatingOpen ? "Updating Device" : "Create New Device"}
            </div>
            <div className={styles.inputContainer}>
              <label>Enter the device ID:</label>
              <input
                type="text"
                onChange={(e) => setInputField(e.target.value)}
                className={styles.inputField}
                placeholder="Enter the device Id"
                value={inputField}
              />
            </div>
            <div className={styles.inputContainer}>
              <label>Select Directory:</label>
              <Multiselect
                key={multiselectKey}
                options={directories}
                displayValue="directoryPath"
                onSelect={(selectedList) => setSelectedDirectories(selectedList)}
                onRemove={(selectedList) => setSelectedDirectories(selectedList)}
                selectedValues={selectedDirectories}
                closeOnSelect={true}
                avoidHighlightFirstOption={true}
                placeholder="Select Directories"
                showArrow={true}
                style={{
                  optionContainer: {
                    maxHeight: "200px"
                  },
                  searchBox: {
                    borderRadius: "10px",
                    border: "1px solid gray"
                  },
                  chips: {
                    background: "#6f6af8",
                  },
                }}
              />
            </div>
            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            <div className={styles.buttonContainer}>
              <button
                className={styles.button}
                onClick={handleClick}
                disabled={isLoading}
              >
                {isUpdatingOpen ? "Update" : "Create"}
              </button>
              <button
                className={styles.CancelButton}
                onClick={handleReset}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProvisionScreen;