import React from "react";

const WidgetCard = ({ title, children, className = "" }) => {
  return (
    <div className={`card-bugcit p-3 ${className}`}>
      {title && <div className="widget-title mb-2">{title}</div>}
      {children}
    </div>
  );
};

export default WidgetCard;
