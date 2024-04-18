import React, {   useState} from "react";
import "./App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import DeviceIdScreen from "./components/DeviceIdScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import ServerLogin from "./components/server/ServerLogin/ServerLogin";
import ProvisionScreen from "./components/server/ProvisionScreen/ProvisionScreen";
import Repositories from "./components/server/Repositories/Repositories";
import {AuthContext} from "./contextApi/authContext";
import cookies from "js-cookie";
import VideoScreen from "./components/videoScreen";

const App = () => {
  const [accessToken, setAccessToken] = useState(() => {
    const cookieAccessToken = cookies.get("hostingAccessToken");
    return cookieAccessToken;
  });

  const removeAccessToken = () => {
    setAccessToken(null);
  };


  return (
    <AuthContext.Provider
      value={{accessToken, setAccessToken, removeAccessToken}}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DeviceIdScreen/>}/>
          <Route path="/serverLogin" element={<ServerLogin/>}/>
          <Route
            path="/provision"
            element={
              <ProtectedRoute
                element={<ProvisionScreen/>}
              />
            }
          />
          <Route
            path="/repositories"
            element={
              <ProtectedRoute
                element={<Repositories/>}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
export default App;
