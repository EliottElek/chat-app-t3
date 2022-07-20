import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Message } from "../../constants/schemas";
import Layout from "../../layout";
import { trpc } from "../../utils/trpc";
import MessageForm from "../../layout/MessageForm";
function MessageItem({
  message,
  session,
}: {
  message: Message;
  session: Session;
}) {
  const baseStyles =
    "text-md max-w-[60%] p-2 text-gray-700 border border-gray-200 rounded-xl";

  const liStyles =
    message.sender.id === session.user?.id
      ? baseStyles
      : baseStyles.concat("self-end bg-gray-700 text-slate-100 rounded-xl");
  return (
    <div
      className={[
        "flex gap-2",
        message.sender.id === session.user?.id && "self-end flex-row-reverse",
      ].join(" ")}
    >
      <span className="flex justify-center items-center h-10 w-10 rounded-full ring-1 ring-gray-200">
        {message.sender.name[0]}
      </span>
      <li className={liStyles}>{message.message}</li>
      <span className="text-xs text-slate-400 self-center">
        {message.sentAt.toLocaleTimeString("en-AU", {
          timeStyle: "short",
        })}
      </span>
      {message.sender.id} {session.user?.id}
    </div>
  );
}

function RoomPage() {
  const { query } = useRouter();
  const roomId = query.roomId as string;
  const { data: session } = useSession();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutateAsync: sendMessageMutation } = trpc.useMutation([
    "room.send-message",
  ]);

  trpc.useSubscription(
    [
      "room.onSendMessage",
      {
        roomId,
      },
    ],
    {
      onNext: (message) => {
        setMessages((m) => {
          return [...m, message];
        });
      },
    }
  );

  return (
    <Layout>
      {!session ? (
        <div>
          <button onClick={() => signIn()}>Login</button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full ">
          <ul className="flex flex-col p-4 flex-1 overflow-auto gap-4">
            {messages.map((m) => {
              return <MessageItem key={m.id} message={m} session={session} />;
            })}
          </ul>
          <MessageForm
            sendMessageMutation={sendMessageMutation}
            roomId={roomId}
            message={message}
            setMessage={setMessage}
          />
        </div>
      )}
    </Layout>
  );
}

export default RoomPage;
