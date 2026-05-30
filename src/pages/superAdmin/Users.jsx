 import React, { useState, useEffect, useCallback } from "react";
  import {
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaEllipsisV,
    FaEdit,
    FaTrash,
  } from "react-icons/fa";
  import { toast, ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import "./Users.css";

  import { USERS_URL, USER_COUNTS_URL } from "../../constant";

  const getRoleClass = (role) => (role || "student").toLowerCase();
  const getStatusClass = (status) => (status || "pending").toLowerCase();

  const Users = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 18;

    const [usersData, setUsersData] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editName, setEditName] = useState("");

    const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token");

    const loadUsers = useCallback(async () => {
      setLoading(true);

      try {
        const token = getToken();

        const response = await fetch(USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to load users.");
        }

        const data = await response.json();

        const countsRes = await fetch(USER_COUNTS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const countsData = await countsRes.json();
        setTotalUsers(countsData.users || 0);

        if (Array.isArray(data)) {
          const formattedUsers = data.map((user) => ({
            id: user.id,
            userName: user.fullName || "N/A",
            role: user.role || "student",
            status: user.verified || user.isVerified ? "active" : "pending",
            joinedDate: "N/A",
            email: user.email || "N/A",
          }));

          const filtered = searchTerm
            ? formattedUsers.filter((user) =>
                user.userName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : formattedUsers;

          setUsersData(
            filtered.slice(
              (currentPage - 1) * usersPerPage,
              currentPage * usersPerPage
            )
          );
          setTotalPages(Math.ceil(filtered.length / usersPerPage) || 1);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    }, [currentPage, searchTerm]);

    useEffect(() => {
      loadUsers();
    }, [loadUsers]);

    useEffect(() => {
      const closeDropdown = (event) => {
        if (
          !event.target.closest(".action-menu") &&
          !event.target.closest(".dropdown-menu")
        ) {
          setOpenDropdown(null);
        }
      };

      const closeOnScrollOrResize = () => {
        setOpenDropdown(null);
      };

      document.addEventListener("mousedown", closeDropdown);
      window.addEventListener("resize", closeOnScrollOrResize);
      window.addEventListener("scroll", closeOnScrollOrResize, true);

      return () => {
        document.removeEventListener("mousedown", closeDropdown);
        window.removeEventListener("resize", closeOnScrollOrResize);
        window.removeEventListener("scroll", closeOnScrollOrResize, true);
      };
    }, []);

    const handleDropdownToggle = (userId, event) => {
      event.stopPropagation();

      if (openDropdown === userId) {
        setOpenDropdown(null);
        return;
      }

      const triggerRect = event.currentTarget.getBoundingClientRect();
      const menuWidth = 150;
      const menuHeight = 96;
      const gap = 8;

      const hasSpaceBelow = window.innerHeight - triggerRect.bottom > menuHeight + gap;

      const top = hasSpaceBelow
        ? triggerRect.bottom + gap
        : Math.max(12, triggerRect.top - menuHeight - gap);

      const left = Math.min(
        window.innerWidth - menuWidth - 12,
        Math.max(12, triggerRect.right - menuWidth)
      );

      setDropdownPosition({ top, left });
      setOpenDropdown(userId);
    };

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        setSelectedUsers(usersData.map((user) => user.id));
      } else {
        setSelectedUsers([]);
      }
    };

    const handleSelectUser = (userId) => {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    };

    const handleEdit = (userId) => {
      const user = usersData.find((item) => item.id === userId);

      if (user) {
        setSelectedUser(user);
        setEditName(user.userName);
        setShowEditModal(true);
      }

      setOpenDropdown(null);
    };

    const handleCloseEditModal = () => {
      setShowEditModal(false);
      setSelectedUser(null);
      setEditName("");
    };

    const handleUpdateUser = async () => {
      try {
        const token = getToken();

        const response = await fetch(`${USERS_URL}/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fullName: editName }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update user.");
        }

        toast.success("User updated successfully.");
        handleCloseEditModal();
        loadUsers();
      } catch (error) {
        toast.error(error.message || "Failed to update user.");
      }
    };

    const handleDelete = async (userId) => {
      const ConfirmDialog = ({ closeToast }) => (
        <div className="confirm-dialog">
          <div className="confirm-dialog-header">
            <div className="confirm-dialog-icon">
              <FaTrash />
            </div>
            <div>
              <p className="confirm-dialog-title">Delete user?</p>
              <p className="confirm-dialog-message">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="confirm-dialog-btn confirm-dialog-cancel"
              onClick={() => {
                closeToast();
                setOpenDropdown(null);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="confirm-dialog-btn confirm-dialog-delete"
              onClick={async () => {
                closeToast();

                try {
                  const token = getToken();

                  const response = await fetch(`${USERS_URL}/${userId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Failed to delete user.");
                  }

                  toast.success("User deleted successfully.");
                  setSelectedUsers((prev) => prev.filter((id) => id !== userId));
                  setCurrentPage(1);
                  await loadUsers();
                } catch (error) {
                  toast.error(error.message || "Failed to delete user.");
                } finally {
                  setOpenDropdown(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      );

      toast(<ConfirmDialog />, {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
        icon: false,
      });
    };

    const filteredUsers = usersData;

    return (
      <>
        <div className="users-container">
          <div className="users-header">
            <div className="users-title-section">
              <h1 className="users-title">User Management</h1>
              <p className="users-summary">Total Users: {totalUsers}</p>
            </div>

            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search Users"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                      checked={
                        usersData.length > 0 &&
                        selectedUsers.length === usersData.length
                      }
                    />
                  </th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>{user.userName}</td>
                      <td className="user-email-cell">{user.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joinedDate}</td>
                      <td>
                        <div className="action-menu">
                          <button
                            className="menu-trigger"
                            onClick={(e) => handleDropdownToggle(user.id, e)}
                          >
                            <FaEllipsisV />
                          </button>

                          {openDropdown === user.id && (
                            <div
                              className="dropdown-menu"
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="dropdown-item edit-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(user.id);
                                }}
                              >
                                <FaEdit className="dropdown-icon" />
                                Edit
                              </button>

                              <button
                                className="dropdown-item delete-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(user.id);
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
                  ))
                )}
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;

                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />

        {showEditModal && (
          <div className="edit-modal-overlay" onClick={handleCloseEditModal}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="edit-modal-title">Edit User</h2>

              <div className="edit-modal-field">
                <label className="edit-modal-label">User Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="edit-modal-input"
                  placeholder="Enter user name"
                />
              </div>

              <div className="edit-modal-field">
                <label className="edit-modal-label">Email</label>
                <input
                  type="email"
                  value={selectedUser?.email || ""}
                  className="edit-modal-input"
                  readOnly
                />
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="edit-modal-btn edit-modal-cancel"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="edit-modal-btn edit-modal-save"
                  onClick={handleUpdateUser}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  export default Users;
