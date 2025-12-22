import React, { useEffect } from "react";

interface Props {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
}

export const AlertMessage: React.FC<Props> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`alert alert-${type === "success" ? "success" : "danger"} 
                 d-flex align-items-center gap-2 mb-4 shadow-sm`}
      role="alert"
    >
      <span>{message}</span>
    </div>
  );
};
