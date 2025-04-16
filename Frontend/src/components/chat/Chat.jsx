import React, { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

const Chat = ({ chats: initialChats, autoOpenUserId }) => {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);
  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);
  const chatRef = useRef(chat);
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  // Auto open chat if autoOpenUserId is provided
  // Auto open chat if autoOpenUserId is provided
  useEffect(() => {
    const tryAutoOpenChat = async () => {
      if (!autoOpenUserId) return;

      const targetChat = chats.find((c) => {
        const otherUserId =
          c.receiver.id === currentUser.id ? c.sender.id : c.receiver.id;
        return otherUserId.toString() === autoOpenUserId.toString();
      });

      if (targetChat) {
        // Chat already exists
        handleOpenChat(targetChat.id, targetChat.receiver);
      } else {
        // Chat doesn't exist, create new
        try {
          const res = await apiRequest.post("/chats", {
            receiverId: autoOpenUserId,
          });

          // ✅ ADD THIS LINE to push the new chat to the list
          setChats((prev) => [...prev, res.data]);

          handleOpenChat(res.data.id, res.data.receiver);
        } catch (err) {
          console.error("Failed to auto-create chat:", err);
        }
      }
    };

    tryAutoOpenChat();
  }, [autoOpenUserId, chats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);

      // Mark messages as read immediately
      if (!res.data.seenBy.includes(currentUser.id)) {
        await apiRequest.put("/chats/read/" + id);
        decrease(); // notification count decrease only if not seen
      }

      setChat({ ...res.data, receiver });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;

    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
      }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: {
          ...res.data,
          chatId: chat.id,
          sender: currentUser,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        // Update open chat if it's the same one
        if (chatRef.current?.id === data.chatId) {
          setChat((prev) => ({
            ...prev,
            messages: [...prev.messages, data],
          }));
        }

        // Update lastMessage in chat list
        setChats((prevChats) => {
          const updated = prevChats.map((c) =>
            c.id === data.chatId ? { ...c, lastMessage: data.text } : c
          );

          // If chatId not found, it may be a new chat (e.g. just created)
          const chatExists = prevChats.some((c) => c.id === data.chatId);
          if (!chatExists) {
            updated.push({
              id: data.chatId,
              lastMessage: data.text,
              receiver: data.sender, // or adjust as needed
              seenBy: [],
              sender: currentUser, // or however your structure looks
            });
          }

          return updated;
        });
      });
    }

    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  // Remove duplicate chats between the same two users
  const uniqueChatsMap = new Map();

  chats.forEach((chat) => {
    const otherUserId =
      chat.receiver.id === currentUser.id ? chat.sender.id : chat.receiver.id;

    const uniqueKey =
      currentUser.id < otherUserId
        ? `${currentUser.id}_${otherUserId}`
        : `${otherUserId}_${currentUser.id}`;

    if (!uniqueChatsMap.has(uniqueKey)) {
      uniqueChatsMap.set(uniqueKey, chat);
    }
  });

  const uniqueChats = Array.from(uniqueChatsMap.values());

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {uniqueChats.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() =>
              handleOpenChat(
                c.id,
                c.receiver.id === currentUser.id ? c.sender : c.receiver
              )
            }
          >
            <img
              src={
                (c.receiver.id === currentUser.id
                  ? c.sender.avatar
                  : c.receiver.avatar) || "/noavatar.jpg"
              }
              alt=""
            />
            <span>
              {(c.receiver.id === currentUser.id
                ? c.sender.username
                : c.receiver.username) || ""}
            </span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>

      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "noavatar.jpg"} alt="" />
              {chat.receiver.username}
            </div>
            <div className="close" onClick={() => setChat(null)}>
              X
            </div>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form className="bottom" onSubmit={handleSubmit}>
            <textarea
              name="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.target.form.requestSubmit();
                }
              }}
            ></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
