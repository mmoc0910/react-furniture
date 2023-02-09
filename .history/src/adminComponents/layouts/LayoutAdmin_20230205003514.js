import React from "react";
import { AiFillCaretDown } from "react-icons/ai";
import {
  BsFillFileTextFill,
  BsFillGridFill,
  BsHandbagFill,
  BsPeopleFill,
} from "react-icons/bs";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "../../clientComponents/components/Logo";
import ReactTooltip from "react-tooltip";
import { FaPager } from "react-icons/fa";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { v4 as uuidv4 } from "uuid";
import { async } from "@firebase/util";
import dayjs from "dayjs";

const menus = [
  {
    id: 1,
    url: "/admin/dashboard",
    title: "Dashboard",
    icon: <BsFillGridFill size={"1.5rem"} color="inherit"></BsFillGridFill>,
  },
  {
    id: 2,
    url: "/admin/orders",
    title: "Dơn hàng",
    icon: (
      <BsFillFileTextFill size={"1.5rem"} color="inherit"></BsFillFileTextFill>
    ),
  },
  {
    id: 3,
    url: "/admin/products",
    title: "Sản phẩm",
    icon: <BsHandbagFill size={"1.5rem"} color="inherit"></BsHandbagFill>,
  },
  {
    id: 4,
    url: "/admin/users",
    title: "Người dùng",
    icon: <BsPeopleFill size={"1.5rem"} color="inher"></BsPeopleFill>,
  },
  {
    id: 5,
    url: "/admin/banners",
    title: "Banners",
    icon: <FaPager size={"1.5rem"} color="inher"></FaPager>,
  },
  // {
  //   id: 6,
  //   url: "/admin/discounts",
  //   title: "Giảm giá",
  //   icon: (
  //     <AiOutlinePercentage size={"1.5rem"} color="inher"></AiOutlinePercentage>
  //   ),
  // },
];
const LayoutAdmin = () => {
  return (
    <>
      <div className="flex w-screen h-screen select-none gap-14 flex-nowrap">
        <div className="flex flex-col items-center justify-between px-5 py-10">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#32776b] text-white font-extrabold text-3xl">
              F
            </div>
            {menus &&
              menus.map((item) => (
                <MenuItem
                  key={item.id}
                  url={item.url}
                  title={item.title}
                  children={item.icon}
                ></MenuItem>
              ))}
          </div>
          <ChatIcon />
        </div>
        <div className="w-full max-w-full pt-10 pb-20 overflow-y-auto pr-14 scroll-smooth">
          <div className="flex items-center justify-between pb-8">
            <Logo color="#32776b" className="text-5xl font-extrabold"></Logo>
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1669546629787-64b58583a5f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1896&q=80"
                className="object-cover rounded-lg w-11 h-11"
                alt=""
              />
              <div className="">
                <p className="flex items-center gap-1 font-bold">
                  Mr.DianaVinhPham
                  <span>
                    <AiFillCaretDown color="#8e8d8c"></AiFillCaretDown>
                  </span>
                </p>
                <p className="text-[#8e8d8c]">Owner</p>
              </div>
            </div>
          </div>
          {<Outlet></Outlet>}
        </div>
      </div>
    </>
  );
};

const MenuItem = ({ url, title, children }) => {
  return (
    <>
      <NavLink
        to={url}
        className={({ isActive }) =>
          `w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? "text-white bg-black" : "text-[#9494a8] bg-[#efefef]"
          }`
        }
        data-tip={title}
      >
        {children}
      </NavLink>
      <ReactTooltip
        padding="7px 15px"
        delayShow={100}
        effect="solid"
        place="right"
      />
    </>
  );
};

const ChatIcon = () => {
  const [state, setState] = React.useState(false);
  return (
    <div className="relative">
      {state && <ChatBox />}
      <div
        className={`flex mb-10 items-center justify-center w-10 h-10 rounded-lg cursor-pointer transition-all duration-150 ${
          state ? "text-white bg-black" : "text-[#9494a8] bg-[#efefef]"
        }`}
        onClick={() => setState((state) => !state)}
      >
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

const ChatBox = () => {
  const [searchUsers, setSearchUsers] = React.useState([]);
  const [chatUsers, setChatUsers] = React.useState([]);
  const [user, setUser] = React.useState();
  const colRef = React.useRef(null);
  React.useEffect(() => {
    const colRef = collection(db, "chatUsers");
    const q = query(colRef);
    onSnapshot(q, (snapshot) => {
      let data = [];
      snapshot.docs.forEach((doc, index) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setChatUsers(data);
      setUser(data[0]);
    });
  }, []);
  const getUser = async (user) => {
    const docRef = doc(db, "chatUsers", user.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUser({ id: docSnap.id, ...docSnap.data() });
      setSearchUsers([]);
      colRef.current.value = "";
    } else {
      await setDoc(doc(db, "chatUsers", user.id), {
        userInfo: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        message: {
          lastMessage: "",
          sendTime: null,
        },
      });
      await setDoc(doc(db, "chats", user.id), {
        messages: [],
      });
      getUser(user);
    }
  };
  return (
    <div className="rounded-lg shadow-chat w-[550px] h-[500px] bg-white absolute bottom-0 left-16 z-50 cursor-default grid grid-cols-5">
      <div className="col-span-2 border-r border-[#e4e4e4] py-3 overflow-hidden">
        <p className="px-3 text-xl font-bold">Chats</p>
        <form
          className="px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (e.target.elements["searchUser"].value) {
              const colRef = collection(db, "users");
              const q = query(
                colRef,
                where(
                  "displayName",
                  ">=",
                  e.target.elements["searchUser"].value
                )
              );
              onSnapshot(q, (snapshot) => {
                let data = [];
                snapshot.docs.forEach((doc, index) => {
                  data.push({ id: doc.id, ...doc.data() });
                });
                setSearchUsers(data);
                console.log(data);
              });
            }
          }}
        >
          <input
            ref={colRef}
            name="searchUser"
            className="px-3 py-1 bg-[#efefef] rounded-full outline-none w-full"
            autoComplete="off"
          />
        </form>
        <div className="w-full h-full overflow-y-scroll scroll-3">
          {searchUsers.length > 0 &&
            searchUsers.map((user) => (
              <SearchUser
                user={user}
                key={uuidv4()}
                onClick={() => getUser(user)}
              />
            ))}
          {chatUsers.length > 0 &&
            searchUsers.length === 0 &&
            chatUsers.map((item) => (
              <UserChat
                user={item}
                key={uuidv4()}
                onClick={() => setUser(item)}
                active={user.id === item.id ? true : false}
              />
            ))}
        </div>
      </div>
      <div className="flex flex-col justify-between col-span-3 overflow-hidden">
        <Chat user={user} />
      </div>
    </div>
  );
};
const Chat = ({ user }) => {
  const [messages, setMessages] = React.useState([]);
  const colRef = React.useRef(null);
  console.log(messages);
  React.useEffect(() => {
    if (user) {
      onSnapshot(doc(db, "chats", user.id), (doc) => {
        setMessages(doc.data().messages);
      });
    }
  }, [user]);
  return (
    <>
      <div className="flex items-center w-full px-3 py-3 text-black">
        {user?.userInfo?.photoURL && (
          <img
            src={user?.userInfo?.photoURL}
            alt=""
            className="w-8 h-8 mr-2 rounded-full"
          />
        )}

        <p className="font-bold text-[#32776b]">
          {user?.userInfo?.displayName}
        </p>
        <span className="ml-auto mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="#32776b"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
          </svg>
        </span>
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="#32776b"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      </div>
      <div className="h-full px-3 overflow-scroll max-h-[90%] scroll-hidden flex flex-col">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full font-semibold">
            Bắt đầu cuộc trò chuyện...
          </div>
        )}
        {messages.length > 0 &&
          messages.map((message) => (
            <div
              key={uuidv4()}
              className={`px-3 leading-tight py-1 rounded-lg w-max max-w-3/4 mt-1 break-words ${
                message.isAdmin
                  ? "text-white bg-[#32776b]"
                  : "text-black bg-[#d7d7d6]"
              }`}
            >
              {message.message}
            </div>
          ))}
      </div>
      <div className="px-5 py-3">
        <form
          className="flex items-center justify-between w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const chatRef = doc(db, "chats", user.id);
            await updateDoc(chatRef, {
              messages: arrayUnion({
                sendAt: dayjs().unix(),
                message: colRef.current.value,
                isAdmin: true,
                dataType: "text",
              }),
            });
            colRef.current.value = "";
          }}
        >
          <input
            className="px-3 py-1 bg-[#efefef] rounded-full outline-none max-w-[80%]"
            ref={colRef}
          />
          <label htmlFor="image">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#32776b"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <input type="file" className="hidden" id="image" />
          <button type="submit">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#32776b"
                className="w-6 h-6"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </>
  );
};
const SearchUser = ({ user, onClick }) => {
  return (
    <div
      className="flex px-3 py-2 items-center hover:bg-[#eeeeee]"
      onClick={onClick}
    >
      <img
        src={user.photoURL}
        alt=""
        className="w-12 h-12 mr-3 rounded-full grow-0 shrink-0"
      />
      <p className="font-semibold">{user.displayName}</p>
    </div>
  );
};
const UserChat = ({ user, onClick, active }) => {
  return (
    <div
      className={`flex px-3 py-2 ${active && "bg-[#eeeeee]"}`}
      onClick={onClick}
    >
      <img
        src={user.userInfo.photoURL}
        alt=""
        className="w-12 h-12 mr-3 rounded-full grow-0 shrink-0"
      />
      <div className="flex flex-col justify-around">
        <p className="font-semibold">{user.userInfo.displayName}</p>
        <p className="line-clamp-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi,
          laboriosam?
        </p>
      </div>
    </div>
  );
};
export default LayoutAdmin;
