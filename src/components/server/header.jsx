import ConnectedTvIcon from "@mui/icons-material/ConnectedTv";
import FolderIcon from "@mui/icons-material/Folder";
import LogoutIcon from "@mui/icons-material/Logout";
import cookies from "js-cookie";
import {AuthContext} from "../../contextApi/authContext";
import {useNavigate} from "react-router";
import styles from "./server.module.css";
import {useContext} from "react";

const Header = ({headerText}) => {
  const {removeAccessToken} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    cookies.remove("hostingAccessToken");
    removeAccessToken();
    navigate("/serverLogin");
  }

  return (
    <>
      <div className={styles.headerButton}>
        <button
          className={styles.logoutButton}
          onClick={
            headerText === "All Devices"
              ? () => navigate("/provision")
              : () => navigate("/repositories")
          }
        >
          {headerText === "All Devices" ? <ConnectedTvIcon/> : <FolderIcon/>}
          {headerText}
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogoutIcon/>
          Log out
        </button>
      </div>
    </>
  )
}

export default Header;