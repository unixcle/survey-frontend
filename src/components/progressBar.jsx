const ProgressBar = ({ label, percent }) => {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontSize: "14px"
        }}
      >
        <span>{label}</span>
        <span>{percent}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#e5e7eb",
          borderRadius: "6px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: "#3b82f6",
            transition: "width 0.4s ease"
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
