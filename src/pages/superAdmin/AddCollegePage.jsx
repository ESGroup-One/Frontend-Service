import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './AddCollegePage.css';

import { COLLEGES_URL } from '../../constant';

const AddCollegePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    collegeName: '',
    adminName: '',
    adminEmail: '',
    adminContact: '',
    collegeWebsite: '',
    sendNotification: true
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [fieldTouched, setFieldTouched] = useState({})
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'collegeName':
        if (!value.trim()) {
          newErrors.collegeName = 'College name is required'
        } else if (value.trim().length < 3) {
          newErrors.collegeName = 'College name must be at least 3 characters'
        } else {
          delete newErrors.collegeName
        }
        break

      case 'adminName':
        if (!value.trim()) {
          newErrors.adminName = 'Admin name is required'
        } else if (value.trim().length < 2) {
          newErrors.adminName = 'Admin name must be at least 2 characters'
        } else {
          delete newErrors.adminName
        }
        break

      case 'adminEmail': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.adminEmail = 'Email is required'
        } else if (!emailRegex.test(value)) {
          newErrors.adminEmail = 'Please enter a valid email address'
        } else {
          delete newErrors.adminEmail
        }
        break
      }

      case 'adminContact':
        if (!value.trim()) {
          newErrors.adminContact = 'Contact info is required'
        } else if (value.trim().length < 8) {
          newErrors.adminContact = 'Contact info must be at least 8 characters'
        } else {
          delete newErrors.adminContact
        }
        break

      case 'collegeWebsite':
        if (value.trim()) {
          const urlRegex = /^https?:\/\/.+\..+/
          if (!urlRegex.test(value)) {
            newErrors.collegeWebsite = 'Please enter a valid website URL'
          } else {
            delete newErrors.collegeWebsite
          }
        } else {
          delete newErrors.collegeWebsite
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    if (fieldTouched[name]) {
      validateField(name, newValue)
    }
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleInputFocus = (e) => {
    const { name } = e.target
    setFieldTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size should be less than 5MB' }))
        return
      }

      setLogoFile(file)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.logo
        return newErrors
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const fieldsToValidate = ['collegeName', 'adminName', 'adminEmail', 'adminContact']
    let isValid = true

    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })

    const touchedFields = {}
    fieldsToValidate.forEach(field => {
      touchedFields[field] = true
    })
    setFieldTouched(touchedFields)

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Map frontend fields to User entity fields (Admin Role)
      const collegeData = {
        collegeName: formData.collegeName,
        fullName: formData.adminName,
        email: formData.adminEmail,
        contactInfo: formData.adminContact,
        websiteUrl: formData.collegeWebsite,
        role: 'admin'
      };

      const response = await fetch(COLLEGES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(collegeData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('College created successfully!');
        setTimeout(() => navigate('/superadmin/colleges'), 1500);
      } else {
        throw new Error( data.message || 'Failed to create college');
      }
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    navigate('/superadmin/colleges')
  }

  return (
    <div className="add-college-page">
      <form onSubmit={handleSubmit} className="add-college-form">
        <div className="form-header">
          <p className="form-subtitle">The following is required.</p>
        </div>

        <div className="form-content">
          {/* College Information Section */}
          <div className="form-section">
            <h3 className="section-title">College Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">College Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    placeholder="Enter the college name"
                    className={`form-input ${errors.collegeName ? 'error' : ''} ${fieldTouched.collegeName && !errors.collegeName && formData.collegeName ? 'success' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {fieldTouched.collegeName && !errors.collegeName && formData.collegeName && (
                    <FaCheck className="input-icon success-icon" />
                  )}
                  {errors.collegeName && (
                    <FaExclamationTriangle className="input-icon error-icon" />
                  )}
                </div>
                {errors.collegeName && (
                  <span className="error-message">{errors.collegeName}</span>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">College Logo</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="form-input"
                      style={{ padding: '8px', cursor: 'pointer' }}
                      disabled={isLoading}
                    />
                    {errors.logo && (
                      <span className="error-message">{errors.logo}</span>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Upload college logo (Max 5MB)
                    </p>
                  </div>
                  {logoPreview && (
                    <div style={{ width: '100px', height: '100px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website Url</label>
                <div className="input-container">
                  <input
                    type="url"
                    name="collegeWebsite"
                    value={formData.collegeWebsite}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    placeholder="Enter the college website url"
                    className={`form-input ${errors.collegeWebsite ? 'error' : ''} ${fieldTouched.collegeWebsite && !errors.collegeWebsite && formData.collegeWebsite ? 'success' : ''}`}
                    disabled={isLoading}
                  />
                  {fieldTouched.collegeWebsite && !errors.collegeWebsite && formData.collegeWebsite && (
                    <FaCheck className="input-icon success-icon" />
                  )}
                  {errors.collegeWebsite && (
                    <FaExclamationTriangle className="input-icon error-icon" />
                  )}
                </div>
                {errors.collegeWebsite && (
                  <span className="error-message">{errors.collegeWebsite}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Info</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="adminContact"
                    value={formData.adminContact}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    placeholder="Enter college contact info"
                    className={`form-input ${errors.adminContact ? 'error' : ''} ${fieldTouched.adminContact && !errors.adminContact && formData.adminContact ? 'success' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {fieldTouched.adminContact && !errors.adminContact && formData.adminContact && (
                    <FaCheck className="input-icon success-icon" />
                  )}
                  {errors.adminContact && (
                    <FaExclamationTriangle className="input-icon error-icon" />
                  )}
                </div>
                {errors.adminContact && (
                  <span className="error-message">{errors.adminContact}</span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="form-section">
            <h3 className="section-title">Register an Admin</h3>
            <p className="section-description">Create an account for an admin who will manage the college</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    placeholder="Enter the Admin Name"
                    className={`form-input ${errors.adminName ? 'error' : ''} ${fieldTouched.adminName && !errors.adminName && formData.adminName ? 'success' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {fieldTouched.adminName && !errors.adminName && formData.adminName && (
                    <FaCheck className="input-icon success-icon" />
                  )}
                  {errors.adminName && (
                    <FaExclamationTriangle className="input-icon error-icon" />
                  )}
                </div>
                {errors.adminName && (
                  <span className="error-message">{errors.adminName}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <div className="input-container">
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    placeholder="Enter email"
                    className={`form-input ${errors.adminEmail ? 'error' : ''} ${fieldTouched.adminEmail && !errors.adminEmail && formData.adminEmail ? 'success' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {fieldTouched.adminEmail && !errors.adminEmail && formData.adminEmail && (
                    <FaCheck className="input-icon success-icon" />
                  )}
                  {errors.adminEmail && (
                    <FaExclamationTriangle className="input-icon error-icon" />
                  )}
                </div>
                {errors.adminEmail && (
                  <span className="error-message">{errors.adminEmail}</span>
                )}
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                name="sendNotification"
                checked={formData.sendNotification}
                onChange={handleInputChange}
                className="form-checkbox"
                id="sendNotification"
                disabled={isLoading}
              />
              <label htmlFor="sendNotification" className="checkbox-label">
                Notify the admin via email
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-submit ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Registering...
              </>
            ) : (
              'Register College'
            )}
          </button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default AddCollegePage
