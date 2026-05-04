import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./styles/profile.module.css";
import { Upload, Loader2, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import fallbackImage from "./styles/Avatar.png";

const API_BASE_URL = 'http://localhost:8000/api';

function MyProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { updateUser } = useAuth();

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUserData(response.data.user);
      const newUserData = response.data.user;
      updateUser(newUserData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user profile. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handler for image upload
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size exceeds 5MB limit.");
      return;
    }

    setImageLoading(true);
    const authToken = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData(response.data.user);
      fetchUserData()

    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to update profile image. Check console for details.");
    } finally {
      setImageLoading(false);
      event.target.value = null;
    }
  };

  const handleClickImageUpload = () => {
    fileInputRef.current.click();
  };


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}> {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>No user data available.</p>
      </div>
    );
  }

  const academicInfo = userData.academicInfo || {};
  const marks = Object.entries(academicInfo).filter(([key]) => key !== 'stream');

  const profileImage = userData.image || fallbackImage;


  return (
    <div>
      <div className={styles.formWrapper}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>
        <p className={styles.sectionSubtitle}>
          This is your personal information.
        </p>

        <div className={styles.photoSection}>
          <div className={styles.photoLabel}>
            <p className={styles.photoTitle}>Profile Photo</p>
            <p className={styles.photoDesc}>
              This image will be shown publicly as your profile picture.
            </p>
          </div>

          <div
            className={styles.photoUpload}
            onClick={!imageLoading ? handleClickImageUpload : undefined}
            title={imageLoading ? "Uploading..." : "Click to change photo"}
          >
            <img
              src={profileImage}
              alt="Profile"
              className={styles.profileImg}
            />
            {imageLoading ? (
              <div className={styles.replaceBox}>
                <Loader2 size={24} className={styles.spinner} />
              </div>
            ) : (
              <div className={styles.replaceBox}>
                <Upload size={24} />
              </div>
            )}

            <p className={styles.replaceText}>
              <span className={styles.clickToReplace}>
                {imageLoading ? "Uploading..." : "Click to replace"}
              </span>
              <br />
              SVG, PNG or JPG (max. 400 × 400px)
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/png, image/jpeg, image/svg+xml"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
            disabled={imageLoading}
          />
        </div>

        {/* Personal Details */}
        <div className={styles.detailsSection}>
          <div className="sub-container">
            <h4 className={styles.subHeading}>Personal Details</h4>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Index Number</label>
                <input type="text" value={userData.indexNumber || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>CID Number</label>
                <input type="text" value={userData.cidNumber || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input type="text" value={userData.name || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" value={userData.email || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <input type="text" value={userData.contactInfo || "N/A"} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Mark Details */}
        <div className={styles.detailsSection}>
          <h4 className={styles.subHeading}>Mark Details</h4>

          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Stream</label>
              <input type="text" value={academicInfo.stream || "N/A"} readOnly />
            </div>

            {/* Dynamically render marks */}
            {marks.map(([subject, mark]) => (
              <div className={styles.inputGroup} key={subject}>
                <label>{subject.charAt(0).toUpperCase() + subject.slice(1)}</label>
                <input type="text" value={mark !== undefined ? mark : 'N/A'} readOnly />
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;