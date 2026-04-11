import { useEffect, useState } from "react";
import Chat from "./Chat";
import Auth from "./Auth";
import supabase from "./supabase";

type Profile = {
  id: string;
  email: string;
};

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      setUserEmail(session?.user?.email || null);
    });

    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) {
        setUsers(data);
      }
    };

    fetchUsers();

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error }: any = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        読み込み中…
      </div>
    );
  }
  if (!userEmail) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <h1 className="text-xl font-bold mb-8">ChatApp</h1>
          <h2 className="text-sm text-gray-400 mb-4 font-semibold">
            ユーザ一覧
          </h2>

          <ul className="space-y-2">
            {users
              .filter((u) => u.email !== userEmail)
              .map((u) => (
                <li
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-2 rounded cursor-pointer ${
                    selectedUser?.id === u.id ? "bg-gray-700" : "bg-gray-800"
                  }`}
                >
                  {u.email}
                </li>
              ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-sm text-gray-300 mb-3 truncate">{userEmail}</p>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {selectedUser ? (
        <Chat selectedUser={selectedUser} currentUserEmail={userEmail} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          左のリストからチャットする相手を選択してください
        </div>
      )}
    </div>
  );
}
