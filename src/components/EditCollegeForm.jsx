import React, { useState, useEffect } from 'react'
import { FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import './AddCollegeForm.css'

const EditCollegeForm = ({ isOpen, onClose, onSubmit, collegeData }) => {
  const [formData, setFormData] = useState({
    collegeName: '',
    adminName: '',
    adminContact: ''
  })

  const [errors, setErrors] = useState({})
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
        
      case 'adminContact':
        if (!value.trim()) {
          newErrors.adminContact = 'Contact info is required'
        } else if (value.trim().length < 8) {
          newErrors.adminContact = 'Contact info must be at least 8 characters'
        } else {
          delete newErrors.adminContact
        }
        break
        
      default:
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Validate field if it has been touched
    if (fieldTouched[name]) {
      validateField(name, value)
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
    const fieldsToValidate = ['collegeName', 'adminName', 'adminContact']
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
    
    try {
      await onSubmit({
        collegeName: formData.collegeName,
        adminName: formData.adminName,
        adminContact: formData.adminContact
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      collegeName: '',
      adminName: '',
      adminContact: ''
    })
    setErrors({})
    setFieldTouched({})
    onClose()
  }

  // Populate form when college data is provided
  useEffect(() => {
    if (isOpen && collegeData) {
      setFormData({
        collegeName: collegeData.name || '',
        adminName: collegeData.admin || '',
        adminContact: collegeData.contactInfo || ''
      })
      setErrors({})
      setFieldTouched({})
    }
  }, [isOpen, collegeData])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit College</h2>
          <button className="modal-close" onClick={handleClose}>
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

          {/* Admin Name */}
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
                placeholder="Enter admin name"
                className={`form-input ${errors.adminName ? 'error' : ''} ${fieldTouched.adminName && !errors.adminName && formData.adminName ? 'success' : ''}`}
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

          {/* Admin Contact */}
          <div className="form-group">
            <label className="form-label">Admin Contact</label>
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

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-add"
              disabled={Object.keys(errors).length > 0}
            >
              Update College
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCollegeForm

