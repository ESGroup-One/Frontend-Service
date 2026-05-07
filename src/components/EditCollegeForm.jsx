import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import axios from 'axios'
import { COLLEGES_URL } from '../constant';
import { toast } from 'react-toastify';
import './AddCollegeForm.css';

const EditCollegeForm = ({ isOpen, onClose, onSubmit, collegeData }) => {
  const [formData, setFormData] = useState({
    collegeName: '',
    fullName: '',
    email: '',
    contactInfo: '',
    websiteUrl: ''
  })

  const [errors, setErrors] = useState({})
  const [fieldTouched, setFieldTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Admin name is required'
        } else {
          delete newErrors.fullName
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
      case 'contactInfo':
        if (!value.trim()) {
          newErrors.contactInfo = 'Contact info is required'
        } else {
          delete newErrors.contactInfo
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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldTouched[name]) validateField(name, value)
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateForm = () => {
    const fieldsToValidate = ['collegeName', 'fullName', 'email', 'contactInfo']
    let isValid = true
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) isValid = false
    })
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('authToken')
      // Call the Spring Boot backend PutMapping("/{id}")
      const response = await axios.put(`${COLLEGES_URL}/${collegeData.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      toast.success('College updated successfully!')
      if (onSubmit) onSubmit(response.data) // Refresh parent list
      onClose()
    } catch (error) {
      console.error('Error updating college:', error)
      toast.error(error.response?.data?.message || 'Failed to update college')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrors({})
    setFieldTouched({})
    onClose()
  }

  useEffect(() => {
    if (isOpen && collegeData) {
      setFormData({
        collegeName: collegeData.collegeName || '',
        fullName: collegeData.fullName || '',
        email: collegeData.email || '',
        contactInfo: collegeData.contactInfo || '',
        websiteUrl: collegeData.websiteUrl || ''
      })
    }
  }, [isOpen, collegeData])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit College Profile</h2>
          <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">College Name</label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`form-input ${errors.collegeName ? 'error' : ''}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`form-input ${errors.email ? 'error' : ''}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <input
              type="text"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact</label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`form-input ${errors.contactInfo ? 'error' : ''}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-add"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? <FaSpinner className="spinner" /> : 'Update College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCollegeForm