import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCarts } from "../../../adminComponents/sagas/carts/cartSlice";
import { setUser } from "../../../adminComponents/sagas/user/userSlice";
import { auth, db } from "../../../firebase/firebase-config";
import { ShoppingIcon } from "../../../icons";
import Logo from "../../components/Logo";
import MenuHeader from "./MenuHeader";
import SearchBarHeader from "./SearchBarHeader";

const HeaderClient = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [show, setShow] = React.useState(false);
  const { carts } = useSelector((state) => state.cart);
  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const colRef = collection(db, "carts");
        const q = query(
          colRef,
          orderBy("createdAt", "desc"),
          orderBy("productId"),
          where("userId", "==", user.uid)
        );
        onSnapshot(q, (snapshot) => {
          let data = [];
          snapshot.docs.forEach((doc, index) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          dispatch(setCarts(data));
        });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // setUser(auth.currentUser);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // console.log("Document data:", docSnap.data());
          dispatch(setUser({ ...docSnap.data() }));
        } else {
          console.log("No such document!");
        }
      } else {
        // setUser("");
        dispatch(setUser({}));
      }
    });
  }, [dispatch]);
  const totalCart = (carts) => {
    let num = 0;
    carts.forEach((item) => (num += item.qty));
    return num;
  };
  return (
    <>
      <div className="fixed w-16 h-16 right-20 bottom-20 z-50 bg-[#4d7a94] rounded-full text-white"></div>
      <div className="hidden py-3 bg-black sm:block">
        <div className="container flex items-center justify-between text-white">
          <p>
            Miễn phí vận chuyển, bảo đảm đổi trả hoặc hoàn tiền trong 30 ngày.
          </p>
          {user.displayName ? (
            <div
              className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white rounded-full uppercase font-extrabold cursor-pointer text-xl leading-none text-[#e53637]"
              onClick={() => navigate("./profile")}
            >
              {!user?.photoURL ? (
                user.displayName?.split("")[0]
              ) : (
                <img src={user?.photoURL} alt="avatar"></img>
              )}
            </div>
          ) : (
            <Link
              className="font-bold underline uppercase decoration"
              to={"/signin"}
            >
              sign in
            </Link>
          )}
        </div>
      </div>
      <div className="py-6">
        <div className="container flex items-center justify-between">
          <Logo></Logo>
          <MenuHeader className="hidden md:block"></MenuHeader>
          <div className="items-center hidden space-x-5 md:flex">
            <SearchBarHeader></SearchBarHeader>
            {/* <HeartIcon size="1.5rem" className="cursor-pointer"></HeartIcon> */}
            <Link to={"/cart"} className="relative cursor-pointer">
              <ShoppingIcon size="1.5rem"></ShoppingIcon>
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-black rounded-full -top-1/2 -right-1/2">
                {carts && totalCart(carts)}
              </span>
            </Link>
          </div>
          <span
            className="cursor-pointer md:hidden menu-icon"
            onClick={() => setShow(true)}
          >
            <AiOutlineMenu size="1.7rem"></AiOutlineMenu>
          </span>
        </div>
      </div>
      <div
        className={`fixed top-0 bottom-0 w-full z-40 md:opacity-0 md:invisible ${
          show ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-all duration-500`}
      >
        <div
          className={`bg-[#00000080] absolute w-full h-full z-30 ${
            show ? "" : "opacity-0"
          } transition-all duration-500`}
          onClick={() => {
            setShow(false);
          }}
        ></div>
        <div
          className={`w-[300px] absolute top-0 bottom-0  bg-white z-40 opacity-100 pt-14 pl-10 ${
            show ? "left-0" : "-left-full"
          } transition-all duration-500`}
        >
          <Link className="text-sm uppercase">sign in</Link>
          <div className="flex items-center space-x-10 mt-7 mb-7">
            <SearchBarHeader></SearchBarHeader>
            {/* <HeartIcon size="1.5rem" className="cursor-pointer"></HeartIcon> */}
            <Link
              to={"/cart"}
              className="relative cursor-pointer"
              onClick={() => setShow(false)}
            >
              <ShoppingIcon size="1.5rem"></ShoppingIcon>
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-black rounded-full -top-1/2 -right-1/2">
                {carts?.length}
              </span>
            </Link>
          </div>
          <MenuHeader></MenuHeader>
        </div>
      </div>
    </>
  );
};

export default HeaderClient;
