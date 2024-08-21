import "./App.css";
// import { Route, Routes } from "react-router-dom";
// import { b64_md5 } from "./utils/GenerateHash";
import  AuthProvider  from "./provider/authProvider";
import Routes from "./routes";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
