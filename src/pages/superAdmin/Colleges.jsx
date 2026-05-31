import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
} from "react-icons/fa";
import "./Colleges.css";

import EditCollegeForm from "../../components/EditCollegeForm";
import { COLLEGES_URL } from "../../constant";

const Colleges = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColleges, setTotalColleges] = useState(0);
  const [collegesData, setCollegesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const collegesPerPage = 12;

  const formatCollege = (college) => ({
    id: college.id,
    collegeName: college.collegeName || "",
    fullName: college.fullName || "",
    email: college.email || "",
    contactInfo: college.contactInfo || "",
    websiteUrl: college.websiteUrl || "",
    name: college.collegeName || "",
    admin: college.fullName || "",
    adminEmail: college.email || "",
    appliedDate: "N/A",
    website: college.websiteUrl || "",
  });

  const loadColleges = useCallback(
    async ({ page = currentPage, search = searchTerm } = {}) => {
      setLoading(true);

      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");

        const response = await fetch(COLLEGES_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to load colleges.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          setCollegesData([]);
          setTotalColleges(0);
          setTotalPages(1);
          return;
        }

        const formattedColleges = data.map(formatCollege);

        const filtered = search
          ? formattedColleges.filter((college) =>
            college.name.toLowerCase().includes(search.toLowerCase())
          )
          : formattedColleges;

        const start = (page - 1) * collegesPerPage;
        const end = page * collegesPerPage;

        setCollegesData(filtered.slice(start, end));
        setTotalColleges(filtered.length);
        setTotalPages(Math.ceil(filtered.length / collegesPerPage) || 1);
      } catch (error) {
        toast.error(error.message || "Error loading colleges.");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchTerm]
  );

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedColleges(collegesData.map((college) => college.id));
    } else {
      setSelectedColleges([]);
    }
  };

  const handleSelectCollege = (collegeId) => {
    setSelectedColleges((prev) =>
      prev.includes(collegeId)
        ? prev.filter((id) => id !== collegeId)
        : [...prev, collegeId]
    );
  };

  const handleAddCollege = () => {
    navigate("/superadmin/AddCollegePage", { replace: false });
  };

  const handleDropdownToggle = (collegeId, event) => {
    event.stopPropagation();

    if (openDropdown === collegeId) {
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
    setOpenDropdown(collegeId);
  };

  const handleEdit = (collegeId) => {
    const college = collegesData.find((item) => item.id === collegeId);

    if (college) {
      setSelectedCollege(college);
      setShowEditModal(true);
    } else {
      toast.error("College not found.");
    }

    setOpenDropdown(null);
  };

  const handleUpdateCollege = async () => {
    toast.success("College updated successfully.");
    setShowEditModal(false);
    setSelectedCollege(null);
    await loadColleges();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCollege(null);
  };

  const handleDelete = async (collegeId) => {
    const ConfirmDialog = ({ closeToast }) => (
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon">
            <FaTrash />
          </div>
          <div>
            <p className="confirm-dialog-title">Delete college?</p>
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
                const token =
                  localStorage.getItem("authToken") || localStorage.getItem("token");

                const response = await fetch(`${COLLEGES_URL}/${collegeId}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(errorText || "Failed to delete college.");
                }

                toast.success("College deleted successfully.");
                setSelectedColleges((prev) => prev.filter((id) => id !== collegeId));
                setSearchTerm("");
                setCurrentPage(1);
                await loadColleges({ page: 1, search: "" });
              } catch (error) {
                toast.error(error.message || "Error deleting college.");
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

  const filteredColleges = collegesData;

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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                    checked={
                      collegesData.length > 0 &&
                      selectedColleges.length === collegesData.length
                    }
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
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                    Loading colleges...
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                    No colleges found.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
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
                            e.stopPropagation();
                            handleDropdownToggle(college.id, e);
                          }}
                        >
                          <FaEllipsisV />
                        </button>

                        {openDropdown === college.id && (
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
                                handleEdit(college.id);
                              }}
                            >
                              <FaEdit className="dropdown-icon" />
                              Edit
                            </button>

                            <button
                              className="dropdown-item delete-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(college.id);
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
            <span>{collegesPerPage} Colleges per page</span>
          </div>

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
                  className={`pagination-btn ${currentPage === pageNum ? "active" : ""
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
        </div>
      </div>

      <EditCollegeForm
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateCollege}
        collegeData={selectedCollege}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Colleges;