import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaSearch, 
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import { userAPI } from '../../utils/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Users.css'

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 18

  const [usersData, setUsersData] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editName, setEditName] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm
      }
      const result = await userAPI.getAll(params)
      
      if (result.users) {
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

        const formattedUsers = result.users.map(user => ({
          id: user._id,
          userName: user.name || user.userName || 'N/A',
          role: user.role || 'student',
          status: user.status || 'active',
          joinedDate: formatDate(user.createdAt),
          email: user.email || 'N/A' // Store email for reference
        }))
        
        setUsersData(formattedUsers)
        setTotalUsers(result.total || result.count || 0)
        // Calculate total pages from total users and users per page
        const calculatedTotalPages = Math.ceil((result.total || result.count || 0) / usersPerPage)
        setTotalPages(calculatedTotalPages || 1)
      }
    } catch {
      // Keep empty array if API fails
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, usersPerPage])

  // Load users from API on component mount
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(usersData.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleEdit = (userId) => {
    const user = usersData.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setEditName(user.userName)
      setShowEditModal(true)
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedUser(null)
    setEditName('')
  }

  const handleUpdateUser = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    try {
      // Use 'name' field as that's what the backend expects
      await userAPI.update(selectedUser.id, { name: editName }, selectedUser.role)
      toast.success('User updated successfully!')
      setShowEditModal(false)
      setSelectedUser(null)
      setEditName('')
      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(`Error updating user: ${error.message || 'Failed to update user'}`)
    }
  }

  const handleDelete = async (userId) => {
    // Custom confirmation dialog using toast
    const ConfirmDialog = ({ closeToast }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
        <p style={{ margin: 0 }}>Are you sure you want to delete this user?</p>
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
                const user = usersData.find(u => u.id === userId)
                const userRole = user?.role || 'student'
                await userAPI.delete(userId, userRole)
                toast.success('User deleted successfully!')
                // Refresh the user list
                loadUsers()
              } catch (error) {
                console.error('Delete error:', error)
                toast.error(`Error deleting user: ${error.message || 'Failed to delete user'}`)
              }
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
  const filteredUsers = usersData

  return (
    <>
      <div className="users-container">
        <div className="users-header">
          <div className="users-title-section">
            <p className="users-summary">Total User : {totalUsers}</p>
          </div>
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === usersData.length}
                  />
                </th>
                <th>User Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>{user.userName}</td>
                  <td>
                    <span className="role-badge">{user.role}</span>
                  </td>
                  <td>
                    <span className="status-badge">{user.status}</span>
                  </td>
                  <td>{user.joinedDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            <span>{usersPerPage} User per page</span>
          </div>
          {loading ? (
            <div className="pagination-loading">
              <span>Loading...</span>
            </div>
          ) : (
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
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Edit User Modal */}
      {showEditModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseEditModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              minWidth: '400px',
              maxWidth: '500px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Edit User</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                User Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                placeholder="Enter user name"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleCloseEditModal}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                style={{
                  padding: '10px 20px',
                  background: '#4640DE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Users
