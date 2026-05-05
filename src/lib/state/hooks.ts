import type { AppDispatchT, RootStateT } from "@/lib/state/store";

import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = useDispatch.withTypes<AppDispatchT>();
export const useAppSelector = useSelector.withTypes<RootStateT>();
