export default function RadioButton({children}) {
    return (
        <button style={{
            backgroundColor: '#55F',
            border: 'none',
            borderTop: '3px solid #0c1078',
            borderBottom: '3px solid #0c1078',
            minWidth: '100px',
            minHeight: '40px',
            cursor: 'pointer',
        }}>{children}</button>
    );
};