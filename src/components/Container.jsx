import React from "react";

export const Container = ({ children, width = "1300px" }) => {
  return (
    <div className={`mx-auto max-w-[${width}] px-4 sm:px-6 lg:px-8`}>
      {children}
    </div>
  );
};
