import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

export const Modal = ({ isOpen, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      className="bg-black/50 grow fixed inset-0 z-50 flex items-center justify-center"
    >
      {children}
    </div>
  );
};

export const ModalTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-black p-6 pb-0">{children}</h2>
);

export const ModalContent = ({ children }) => (
  <div className="w-full max-h-[calc(100%-50px)] md:w-2/3 bg-gray-100 relative rounded">{children}</div>
);

export const ModalDismissButton = ({ onClick }) => (
  <button
    type="button"
    className="absolute top-0 right-0 p-4 text-gray-500 hover:text-gray-700"
    onClick={onClick}
  >
    <span className="sr-only">
      <FormattedMessage
        id="app.learningDashboard.closeHelpModal"
        defaultMessage="Close dashboard help modal"
      />
    </span>
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

export const ModalBody = ({ children }) => (
  <div className="p-6 overflow-auto max-h-full">
    {children}
  </div>
);
