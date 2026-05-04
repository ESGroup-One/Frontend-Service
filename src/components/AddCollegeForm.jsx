import React, { useState, useEffect } from 'react'
import { FaTimes, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'
import './AddCollegeForm.css'

const AddCollegeForm = ({ isOpen, onClose, onSubmit }) => {
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
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [fieldTouched, setFieldTouched] = useState({})

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
        
      case 'adminEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.adminEmail = 'Email is required'
        } else if (!emailRegex.test(value)) {
          newErrors.adminEmail = 'Please enter a valid email address'
        } else {
          delete newErrors.adminEmail
        }
        break
        
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
    
    // Validate field if it has been touched
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

  const validateForm = () => {
    const fieldsToValidate = ['collegeName', 'adminName', 'adminEmail', 'adminContact']
    let isValid = true
    const newErrors = {}
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })
    
    // Mark all fields as touched
    const touchedFields = {}
    fieldsToValidate.forEach(field => {
      touchedFields[field] = true
    })
    setFieldTouched(touchedFields)
    
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setIsSubmitted(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      await onSubmit(formData)
      
      // Show success state briefly before closing
      setTimeout(() => {
        handleClose()
      }, 1000)
      
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsLoading(false)
      setIsSubmitted(false)
    }
  }

  const handleClose = () => {
    setFormData({
      collegeName: '',
      adminName: '',
      adminEmail: '',
      adminContact: '',
      collegeWebsite: '',
      sendNotification: true
    })
    setErrors({})
    setFieldTouched({})
    setIsLoading(false)
    setIsSubmitted(false)
    onClose()
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        collegeName: '',
        adminName: '',
        adminEmail: '',
        adminContact: '',
        collegeWebsite: '',
        sendNotification: true
      })
      setErrors({})
      setFieldTouched({})
      setIsLoading(false)
      setIsSubmitted(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New College</h2>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* College Name */}
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
                placeholder="Enter college name"
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

          {/* Assign Admin Section */}
          <div className="form-section">
            <h3 className="section-title">Assign Admin</h3>
            
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
                  placeholder="Enter name"
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
              <label className="form-label">Email</label>
              <div className="input-container">
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="Enter Email"
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
                  Send notification via email
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Contact Info</label>
              <div className="input-container">
                <input
                  type="text"
                  name="adminContact"
                  value={formData.adminContact}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="Enter contact info"
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

          {/* College Website */}
          <div className="form-group">
            <label className="form-label">College Website Link</label>
            <div className="input-container">
              <input
                type="url"
                name="collegeWebsite"
                value={formData.collegeWebsite}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                placeholder="Enter college website link"
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

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn-add ${isLoading ? 'loading' : ''} ${isSubmitted ? 'success' : ''}`}
              disabled={isLoading || Object.keys(errors).length > 0}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Adding...
                </>
              ) : isSubmitted ? (
                <>
                  <FaCheck />
                  Added!
                </>
              ) : (
                'Add College'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCollegeForm
