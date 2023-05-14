import React, { useEffect, useState } from "react";
import { createPortal }               from "react-dom";
import { create } from "zustand";
import { shallow } from "zustand/shallow";
import cn from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export interface ToastStoreInterface {
  toastId?: string;
  toastList: Set<any>;
  show: (toastId: string) => void;
  close: (toastId: string) => void;
  closeAll: () => void;
};

const useToastStore = create<ToastStoreInterface>((set, get) => ({
  toastList: new Set(),
  show(toastId) {
    const { toastList } = get();
    
    const newToastList = new Set(toastList);
    newToastList.add(toastId);
    
    set({
      toastList: newToastList
    });
  },
  close(toastId) {
    const { toastList } = get();
    
    const newToastList = new Set(toastList);
    newToastList.delete(toastId);
    
    set({
      toastList: newToastList
    });
  },
  closeAll() {
    const newToastList = new Set();
    
    set({
      toastList: newToastList
    });
  }
}));

type ToastConfig = {
  duration: number;
  role: string;
}

type Toast = {
  uniqueId: string;
  config: ToastConfig | any;
  className: string;
  children: React.ReactNode;
}

export function Toasts(props: Toast) {
  const { uniqueId, config = {}, className, children } = props;
  const { duration = 3500, role = "status" } = config;
  const [mount, setMount] = useState(false);
  
  const { toastList, close } = useToastStore(
    (store) => ({
      toastList: store.toastList,
      close: store.close
    }),
    shallow
  );
  
  const isShown = toastList.has(uniqueId);
  
  useEffect(() => {
    if (!duration || !isShown) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      close(uniqueId);
    }, duration);
  
    setMount(true);
    return () => {
      setMount(false);
      clearTimeout(timeoutId);
    };
  }, [uniqueId, isShown, duration, close]);
  
  return mount ? createPortal(
    <AnimatePresence>
      {isShown && (
        <motion.div
          key={uniqueId}
          layout
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.5 }}
          className={cn("toast", className)}
          role={role}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.querySelector("#toasts-portal") as HTMLElement
  ): null;
}

export function useToastControls() {
  const controls = useToastStore(
    (store) => ({
      show: store.show,
      close: store.close,
      closeAll: store.closeAll
    }),
    shallow
  );
  
  return controls;
}
