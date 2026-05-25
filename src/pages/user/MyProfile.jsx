import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./styles/profile.module.css";
import { Upload, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UPLOAD_PROFILE_IMAGE_URL } from "../../constant";

import fallbackImage from "./styles/Avatar.png";

function MyProfile() {
  const { user, updateUser } = useAuth(); // Read live user information cleanly from context
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Handler for profile image upload / update
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    setImageLoading(true);
    setUploadError(null);

    const authToken = localStorage.getItem("authToken");
    const formData = new FormData();

    // Key must match exactly with @RequestParam("file") in Spring Boot
    formData.append("file", file);

    try {
      // Connect directly through the gateway using your route constant
      const response = await axios.post(UPLOAD_PROFILE_IMAGE_URL(user.id), formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // The Spring Boot endpoint sends back the complete updated User object
      const updatedUser = response.data;

      // Save to localStorage and update context state globally instantly
      updateUser(updatedUser);

    } catch (err) {
      console.error("Error uploading image:", err);
      setUploadError(err.response?.data?.message || "Failed to update profile image.");
    } finally {
      setImageLoading(false);
      event.target.value = null; // Reset input choice configuration assignment
    }
  };

  const handleClickImageUpload = () => {
    fileInputRef.current.click();
  };

  // Safe fallback guard block if AuthContext is establishing user data on mount
  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Loading profile data...</p>
      </div>
    );
  }

  // Maps cleanly to your updated Spring Boot entity property key
  const profileImage = user.profileImageUrl || fallbackImage;

  // Extract academic marks metadata fields cleanly
  const academicMarks = user.academicMarks || {};
  const marks = Object.entries(academicMarks).filter(([key]) => key !== 'stream');

  return (
    <div>
      <div className={styles.formWrapper}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>
        <p className={styles.sectionSubtitle}>
          This is your personal information.
        </p>

        {uploadError && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{uploadError}</p>
          </div>
        )}

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

        {/* Personal Details Section */}
        <div className={styles.detailsSection}>
          <div className="sub-container">
            <h4 className={styles.subHeading}>Personal Details</h4>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Index Number</label>
                <input type="text" value={user.indexNumber || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>CID Number</label>
                <input type="text" value={user.cid || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input type="text" value={user.fullName || "N/A"} readOnly />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" value={user.email || "N/A"} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Mark Details Section */}
        <div className={styles.detailsSection}>
          <h4 className={styles.subHeading}>Mark Details</h4>

          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Stream</label>
              <input type="text" value={academicMarks.stream || "N/A"} style={{ textTransform: 'capitalize' }} readOnly />
            </div>

            {/* Dynamically render individual subject fields */}
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