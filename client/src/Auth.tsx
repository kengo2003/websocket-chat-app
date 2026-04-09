import { useState } from "react";
import supabase from "./supabase";

type AuthProps = {
  setLoggedIn: (value: boolean) => void;
};

const Auth = ({ setLoggedIn }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      setLoggedIn(true);
    }
  };

  const handleSignIn = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      setErrorMessage("ログイン失敗" + error.message);
    } else {
      setLoggedIn(true);
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto text-center">
      <h2 className="text-xl mb-4 font-bold">ログイン / 新規登録</h2>

      {errorMessage && (
        <p className="text-red-500 mb-4 text-sm">{errorMessage}</p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="パスワード (6文字以上)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleSignUp}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          新規登録
        </button>
        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </div>
    </div>
  );
};

export default Auth;
