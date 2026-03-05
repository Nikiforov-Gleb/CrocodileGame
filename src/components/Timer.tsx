import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../store/store.ts";
import { socket } from "../server/socket.ts";
import { setLastTime } from "../features/gameflowSlice.ts";

export const Timer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const timeLast = useSelector((state: RootState) => state.gameflow.timeLast);

  useEffect(() => {
    const handleTime = (timeLeft: number) => {
      dispatch(setLastTime(timeLeft));
    };

    socket.on("timeUpdate", handleTime);

    return () => {
      socket.off("timeUpdate", handleTime);
    };
  }, [dispatch]);

  return <span className="guessed-word">{timeLast}</span>;
};
