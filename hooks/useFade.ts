import { useEffect, useState } from "react";

export function useFade() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  function getFadeStyle(fadingOut: boolean) {
    return { opacity: fadingOut ? 0 : visible ? 1 : 0 };
  }

  return { visible, getFadeStyle };
}