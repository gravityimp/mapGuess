import { Children, cloneElement } from "react";

export default function ButtonGroup({ children, multiple, active }) {
  return (
    <div className="button-group">
      {children.map((child, index) => {
        return cloneElement(child, {
          key: index,
          className:
            multiple === true
              ? active.includes(child.props.children)
                ? "button button--active"
                : "button"
              : child.props.children === active
              ? "button button--active"
              : "button",
        });
      })}
    </div>
  );
}
