import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactElement,
} from "react";

interface AuthContextType {
  token: string|null;
  setToken: (newToken: string) => void;
}
interface AuthProviderProps {
  children: ReactElement;
}

const AuthContext = createContext<AuthContextType>({
  token: '',
  setToken: () => {},
});

const AuthProvider = ({ children }: AuthProviderProps) => {
  // State to hold the authentication token
  const [token, setToken_] = useState<string>(
    localStorage.getItem("token")||""
  );

  // Function to set the authentication token
  const setToken = (newToken: string) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
