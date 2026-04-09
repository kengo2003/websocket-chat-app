import { useState } from "react";
import Chat from "./Chat";
import Auth from "./Auth";

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return <>{isLoggedIn ? <Chat /> : <Auth setLoggedIn={setLoggedIn} />}</>;
}
