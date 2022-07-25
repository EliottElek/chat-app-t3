import {
  FolderOpenIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from "@heroicons/react/outline";
const MessageForm = ({ sendMessageMutation, roomId, message, setMessage }) => {
  return (
    <div className="p-3 flex gap-4 items-center">
      <button className="text-gray-500">
        <FolderOpenIcon className="h-6 w-6" />
      </button>
      <button className="text-gray-500">
        <PaperClipIcon className="h-6 w-6" />
      </button>
      <form
        className="flex flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (message === "") return;

          sendMessageMutation({
            roomId: roomId,
            message: message,
          });
          setMessage("");
        }}
      >
        <input
          className="black rounded-full p-2.5 pl-3 w-full h-auto text-gray-500 bg-gray-50 border border-gray-200 focus: outline-green-600"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Aa"
        />
        <button
          className="flex-1 rounded-full text-gray-500 p-3.5"
          type="submit"
        >
          <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
        </button>
      </form>
    </div>
  );
};

export default MessageForm;
