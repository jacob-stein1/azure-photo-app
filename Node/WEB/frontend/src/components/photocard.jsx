import React from "react";
import Loader from "./loader";

const PhotoCard = ({ photo }) => {
  const styles = {
    cardStyle: {
      width: "200px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      borderRadius: "5px",
      overflow: "hidden",
    },
    imgStyle: {
      width: "100%",
      height: "auto",
      display: "block",
    },
    loaderContainer: {
      width: "100%",
      height: "150px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    contentContainer: {
      padding: "10px",
    },
    headerStyle: {
      fontSize: "16px",
      margin: "0 0 10px 0",
    },
    paragraphStyle: {
      margin: "0 0 5px 0",
    },
    buttonStyle: {
      color: "#007bff",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.cardStyle}>
      {photo.isLoading ? (
        <div style={styles.loaderContainer}>
          <Loader />
        </div>
      ) : (
        <img
          src={photo.urlThumbnail}
          alt={photo.textCaption}
          style={styles.imgStyle}
        />
      )}
      <div style={styles.contentContainer}>
        <h2 style={styles.headerStyle}>{photo.filename}</h2>
        {photo.isLoading ? (
          <></>
        ) : (
          <>
            <p style={styles.paragraphStyle}>Caption: {photo.textCaption}</p>
            <button
              style={styles.buttonStyle}
              onClick={() => window.open(photo.urlOriginalImage, "_blank")}
            >
              Download Original
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
