import React, { useState, useEffect } from "react";
import axios from "axios";
import PhotoCard from "./photocard";

const UploadButton = () => {
  const [photos, setPhotos] = useState([]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("filename", file, file.name);
      setPhotos((prevPhotos) => [
        ...prevPhotos,
        { filename: file.name, isLoading: true },
      ]);

      try {
        await axios.post("/api/uploadFile", formData);
        startPolling(file.name);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Upload failed!");
      }
    }
  };

  const startPolling = (filename) => {
    const interval = setInterval(async () => {
      const response = await axios.get("/api/uploadComplete");
      if (response.status === 200 && response.data.filename === filename) {
        setPhotos((prevPhotos) =>
          prevPhotos.map((photo) =>
            photo.filename === filename
              ? { ...response.data, isLoading: false }
              : photo
          )
        );
        clearInterval(interval);
      }
    }, 5000);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/getImages");
        const loadedPhotos = response.data.map((img) => ({
          filename: img.filename,
          isLoading: false,
          urlThumbnail: img.urlThumbnail,
          urlOriginalImage: img.urlOriginalImage,
          textCaption: img.textCaption,
        }));
        setPhotos(loadedPhotos);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  const commonStyle = {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderRadius: "5px",
  };

  const styles = {
    photoDisplayContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      padding: "100px",
      ...commonStyle,
    },
    uploadLabel: {
      padding: "10px 20px",
      fontSize: "16px",
      color: "#fff",
      backgroundColor: "#007bff",
      border: "none",
      cursor: "pointer",
      outline: "none",
      transition: "background-color 0.3s",
      ...commonStyle,
    },
    hiddenInput: {
      display: "none",
    },
  };

  return (
    <div>
      <div style={styles.photoDisplayContainer}>
        {photos.map((photo, index) => (
          <PhotoCard key={index} photo={photo} />
        ))}
      </div>
      <label htmlFor="upload-photo" style={styles.uploadLabel}>
        Upload Photo
      </label>
      <input
        id="upload-photo"
        type="file"
        style={styles.hiddenInput}
        onChange={handleUpload}
        accept="image/*"
      />
    </div>
  );
};

export default UploadButton;
