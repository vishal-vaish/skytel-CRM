import React, {useState} from "react";
import styles from "./ServerLogin.module.css";
import {useNavigate} from "react-router";
import cookies from "js-cookie"
import {toast} from "sonner";
import requester from "../../../requester";

const ServerLogin = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setErrorMessage("");
    if (username.trim() === "" || password.trim() === "") {
      setErrorMessage("Field cannot be Empty");
    }

    const encodedCredentials = btoa(`${username}:${password}`);
    setIsLoading(true);
    requester.get('/token', {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'application/json'
        },
      })
      .then((response) => {
        const accessToken = response.data;
        const cookieOptions = {
          path: '/'
        };
        cookies.set('hostingAccessToken', accessToken, cookieOptions);
        navigate('/provision');
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setErrorMessage("Invalid Credential")
        } else {
          toast.error(error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.inputContainer}>
        <label>Enter the Username</label>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          className={styles.inputField}
          placeholder="Type here..."
        />
      </div>
      <div className={styles.inputContainer}>
        <label>Enter the Password</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
          placeholder="Type here..."
        />
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <button className={styles.button} disabled={isLoading} onClick={handleSubmit}>
        Login
      </button>
    </div>
  )
}

export default ServerLogin;