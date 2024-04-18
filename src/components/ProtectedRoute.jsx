import React, {useEffect} from "react";
import cookies from "js-cookie";
import {useNavigate} from "react-router";

const ProtectedRoute = ({element, ...rest}) => {
  const accessToken = cookies.get("hostingAccessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/serverLogin");
    }
  }, [accessToken, navigate]);

  return <>{React.cloneElement(element)}</>
};

export default ProtectedRoute;