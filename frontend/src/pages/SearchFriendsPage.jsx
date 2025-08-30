import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import RippleBackground from "../components/RippleBackground";

const SearchFriendsPage = () => {
  const { users, searchUsers, getfriends, isUSersLoading, addFriend } = useChatStore();
  const { authUser } = useAuthStore();
  const [isFriend, setIsFriend] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchUsers(query);
  };

  const handleAddFriend = async (friendId) => {
    try {
      await addFriend(friendId); // use store action
      toast.success("Friend added!");
      getfriends(); // refresh friends list
      setIsFriend(true);
    } catch (err) {
      toast.error(err?.message || "Failed to add friend");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 justify-center flex flex-col items-center opacity-70 ">
      <h1 className="text-2xl font-bold mb-4 ">Search Friends To Start Chatting!</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="input input-bordered flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {isUSersLoading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        <ul className="space-y-2 flex ">
          {users.map((user) => (
                  <li
        key={user._id}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-base-200 rounded-lg"
      >
        <div className="flex items-center mb-2 sm:mb-0">
          <img
            src={user.profilePic || "/avatar.png"}
            alt="profile pic"
            className="size-12 rounded-full object-cover border-2 mr-3"
          />
          <div className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>
            <p className="text-sm opacity-70">{user.email}</p>
          </div>
        </div>

        {user._id !== authUser._id && (
          <button
            className="btn btn-sm btn-outline w-full sm:w-auto"
            onClick={() => handleAddFriend(user._id)}
            disabled={isFriend || authUser.friends.includes(user._id)}
          >
            <UserPlus className="size-4 mr-1" />
            {isFriend ? "Added" : "Add Friend"}
          </button>
        )}
      </li>

          ))}
        </ul>
      )}
      <RippleBackground />

    </div>
  );
};

export default SearchFriendsPage;
