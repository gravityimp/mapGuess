export default function Modal({ children, header, close }) {

function handleModalClick(e) {
    e.stopPropagation();
}

  return (
    <div className="modal__background" onClick={close}>
      <div className="modal" onClick={handleModalClick}>
        <h2>{header}</h2>
        {children}
      </div>
    </div>
  );
}
