import React from "react";
const MessageForm = ({ sendMessageMutation, roomId, message, setMessage }) => {
  return (
    <form
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();

        sendMessageMutation({
          roomId: roomId,
          message: message,
        });

        setMessage("");
      }}
    >
      <input
        className="black  p-2.5 w-full h-auto text-gray-700 bg-gray-50 border border-gray-200"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message here..."
      />
      <button className="flex-1 text-white bg-gray-900 p-3.5" type="submit">
        Send
      </button>
    </form>
  );
};

export default MessageForm;
