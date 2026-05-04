import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EditCollegeForm from '../../components/EditCollegeForm'
import { collegeAPI } from '../../utils/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV
} from 'react-icons/fa'
import './Colleges.css'

const Colleges = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColleges, setSelectedColleges] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalColleges, setTotalColleges] = useState(0)
  const collegesPerPage = 12

  // Start with empty array - data will be loaded from API
  const [collegesData, setCollegesData] = useState([])

  const loadColleges = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: collegesPerPage,
        search: searchTerm
      }
      const result = await collegeAPI.getAll(params)
      
      if (result.data && result.data.colleges) {
        const formatDate = (dateString) => {
          if (!dateString) return 'N/A'
          try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'N/A'
            return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          } catch {
            return 'N/A'
          }
        }

        const formattedColleges = result.data.colleges.map(college => ({
          id: college._id,
          name: college.name || '',
          admin: college.admin?.name || '',
          adminEmail: college.admin?.email || '',
          contactInfo: college.admin?.contactInfo || '',
          appliedDate: formatDate(college.formattedAppliedDate || college.appliedDate || college.createdAt),
          website: college.website || ''
        }))
        setCollegesData(formattedColleges)
        setTotalPages(result.data.pagination?.totalPages || 1)
        setTotalColleges(result.data.pagination?.totalColleges || 0)
      }
    } catch {
      // Keep empty array if API fails
    }
  }, [currentPage, searchTerm, collegesPerPage])

  // Load colleges from API on component mount
  useEffect(() => {
    loadColleges()
  }, [loadColleges])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking anywhere outside the dropdown menus
      if (!event.target.closest('.action-menu')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedColleges(collegesData.map(college => college.id))
    } else {
      setSelectedColleges([])
    }
  }

  const handleSelectCollege = (collegeId) => {
    setSelectedColleges(prev =>
      prev.includes(collegeId)
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId]
    )
  }

  const handleAddCollege = () => {
    navigate('/superadmin/AddCollegePage', { replace: false })
  }

  const handleDropdownToggle = (collegeId, event) => {
    const newState = openDropdown === collegeId ? null : collegeId
    setOpenDropdown(newState)
    
    // If opening dropdown, check if it needs to be positioned upward
    if (newState && event) {
      setTimeout(() => {
        const menuElement = event.currentTarget.closest('.action-menu')?.querySelector('.dropdown-menu')
        if (menuElement) {
          const rect = menuElement.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          
          // If dropdown would overflow bottom of viewport, position it upward
          if (rect.bottom > viewportHeight - 20) {
            menuElement.classList.add('dropdown-menu-up')
          } else {
            menuElement.classList.remove('dropdown-menu-up')
          }
        }
      }, 0)
    }
  }

  const handleEdit = (collegeId) => {
    const college = collegesData.find(c => c.id === collegeId)
    if (college) {
      setSelectedCollege(college)
      setShowEditModal(true)
    } else {
      toast.error('College not found')
    }
    setOpenDropdown(null)
  }

  const handleUpdateCollege = async (updateData) => {
    try {
      await collegeAPI.update(selectedCollege.id, updateData)
      toast.success('College updated successfully!')
      
      // Reload colleges
      setSearchTerm('')
      const params = {
        page: currentPage,
        limit: collegesPerPage,
        search: ''
      }
      
      collegeAPI.getAll(params).then(result => {
        if (result.data && result.data.colleges) {
          const formatDate = (dateString) => {
            if (!dateString) return 'N/A'
            try {
              const date = new Date(dateString)
              if (isNaN(date.getTime())) return 'N/A'
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            } catch {
              return 'N/A'
            }
          }

          const formattedColleges = result.data.colleges.map(college => ({
            id: college._id,
            name: college.name || '',
            admin: college.admin?.name || '',
            adminEmail: college.admin?.email || '',
            contactInfo: college.admin?.contactInfo || '',
            appliedDate: formatDate(college.formattedAppliedDate || college.appliedDate || college.createdAt),
            website: college.website || ''
          }))
          setCollegesData(formattedColleges)
          setTotalPages(result.data.pagination?.totalPages || 1)
          setTotalColleges(result.data.pagination?.totalColleges || 0)
        }
      }).catch(() => {})
    } catch (error) {
      toast.error(`Error updating college: ${error.message}`)
      throw error
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedCollege(null)
  }

  const handleDelete = async (collegeId) => {
    // Custom confirmation dialog using toast
    const ConfirmDialog = ({ closeToast }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
        <p style={{ margin: 0 }}>Are you sure you want to delete this college?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            style={{ 
              padding: '8px 20px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={async () => {
              closeToast();
              try {
                await collegeAPI.delete(collegeId)
                toast.success('College deleted successfully!')
                
                // Reload colleges
                setSearchTerm('')
                const params = {
                  page: currentPage,
                  limit: collegesPerPage,
                  search: ''
                }
                
                collegeAPI.getAll(params).then(result => {
                  if (result.data && result.data.colleges) {
                    const formattedColleges = result.data.colleges.map(college => ({
                      id: college._id,
                      name: college.name || '',
                      admin: college.admin?.name || '',
                      adminEmail: college.admin?.email || '',
                      contactInfo: college.admin?.contactInfo || '',
                      appliedDate: college.formattedAppliedDate || college.appliedDate || '',
                      website: college.website || ''
                    }))
                    setCollegesData(formattedColleges)
                    setTotalPages(result.data.pagination?.totalPages || 1)
                    setTotalColleges(result.data.pagination?.totalColleges || 0)
                  }
                }).catch(() => {})
              } catch (error) {
                toast.error(`Error deleting college: ${error.message}`)
              }
              setOpenDropdown(null)
            }}
          >
            Yes, Delete
          </button>
          <button
            style={{ 
              padding: '8px 20px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => {
              closeToast();
              setOpenDropdown(null);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
    
    toast.info(<ConfirmDialog />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: true,
    });
  }

  // Search is now handled by the backend API
  const filteredColleges = collegesData

  return (
    <>
      <div className="colleges-container">
        <div className="colleges-header">
          <div className="colleges-title-section">
            <p className="colleges-summary">Total College : {totalColleges}</p>
          </div>

          <div className="colleges-actions">
            <button className="add-college-btn" onClick={handleAddCollege}>
              + Add College
            </button>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search Colleges"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="colleges-table-container">
          <table className="colleges-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedColleges.length === collegesData.length}
                  />
                </th>
                <th>Colleges Name</th>
                <th>Admin</th>
                <th>Admin Email</th>
                <th>Contact Info</th>
                <th>Applied Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.map((college) => (
                <tr key={college.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedColleges.includes(college.id)}
                      onChange={() => handleSelectCollege(college.id)}
                    />
                  </td>
                  <td>{college.name}</td>
                  <td>{college.admin}</td>
                  <td>{college.adminEmail}</td>
                  <td>{college.contactInfo}</td>
                  <td>{college.appliedDate}</td>
                  <td>
                    <div className="action-menu">
                      <button
                        className="menu-trigger"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDropdownToggle(college.id, e)
                        }}
                      >
                        <FaEllipsisV />
                      </button>
                      {openDropdown === college.id && (
                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="dropdown-item edit-item"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(college.id)
                            }}
                          >
                            <FaEdit className="dropdown-icon" />
                            Edit
                          </button>
                          <button
                            className="dropdown-item delete-item"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(college.id)
                            }}
                          >
                            <FaTrash className="dropdown-icon" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            <span>{collegesPerPage} Colleges per page</span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Edit College Modal */}
      <EditCollegeForm
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateCollege}
        collegeData={selectedCollege}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default Colleges
