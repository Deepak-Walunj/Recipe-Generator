import React, { createContext, useContext, useState, useCallback } from "react";
import "@components/pages/css/Toast.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  const showToast = useCallback((message, type = "success") => {
    const id = toastIdCounter;
    setToastIdCounter(prev => prev + 1);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Remove after 1 second
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  }, [toastIdCounter]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast UI */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
