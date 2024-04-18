import axios from "axios";
import {toast} from "sonner";

export const baseURL = "http://65.109.64.7/api";

export const getHeaders = (accessToken) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  };
  return headers;
};

const config = {
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    withCredentials: true,
  },
  baseURL: baseURL,
};

const requester = axios.create(config);
requester.interceptors.response.use(
  (response) => response,
  function (error) {
    if (error.response) {
      if (error.message === "Network Error") {
        toast.error(`Connection Failed`);
      } else if (error.response.status === 401 &&
        !(error.response.config.url === "/token")
      ) {
        window.location.href = "/serverlogin";
      }
      return Promise.reject(error);
    }
  }
);

export default requester;

