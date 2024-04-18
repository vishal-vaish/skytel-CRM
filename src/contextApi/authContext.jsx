import {createContext} from "react";

export const AuthContext = createContext({
    accessToken: null,
    setAccessToken: () => {},
    removeAccessToken: () => {}
})
