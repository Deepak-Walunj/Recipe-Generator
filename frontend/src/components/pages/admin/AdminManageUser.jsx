import { useEffect, useState, useRef } from "react";
import { getAllUsers, adminRegistrationApi, deleteEntityApi } from "@repositories/AdminRepo.jsx";
import { userRegistrationApi } from "@repositories/UserRepo.jsx";
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx";
import '@components/pages/css/Table.css';
import '@components/pages/css/Modal.css';

export default function AdminManageUsers() {
  const { user } = useUser();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);

  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingEntityType, setDeletingEntityType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const addFormRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    entity_type: "user",
  });
  const [submitting, setSubmitting] = useState(false);

  const token = user?.access_token;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers({
        token: token,
        search: search || null,
        page: page || 1,
        limit: limit || 10,
      });

      if (response?.success) {
        const payload = response.data || {};
        const usersList = payload.users || [];
        // console.log(usersList)
        setUsers(usersList);
        setTotalFetched(usersList.length);
        setHasMore(Number(payload.limit) ? usersList.length === Number(payload.limit) : usersList.length === l);
        setPage(Number(payload.page) || p);
      } else {
        showToast(response?.message || "Failed to fetch users", "error");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showToast(err?.message || "Unable to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, page, search, limit]);

  const goPrev = () => {
    if (page <= 1) return;
    setPage(prev => prev - 1);
  };

  const goNext = () => {
    if (!hasMore) return;
    setPage(prev => prev + 1);
  };

  const updateFormField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return showToast("Username is required", "error");
    if (!form.email.trim()) return showToast("Email is required", "error");
    if (!form.password.trim()) return showToast("Password is required", "error");
    if (!form.entity_type) return showToast("Please choose entity type", "error");
    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      entity_type: form.entity_type,
    };
    setSubmitting(true);
    try {
      let response;
      if (form.entity_type === "admin") {
        response = await adminRegistrationApi(payload);
      } else {
        response = await userRegistrationApi(payload);
      }
      if (response?.success) {
        showToast("Registered successfully", "success");
        setPage(1);
        await fetchUsers(1, search, limit);
        setShowAddForm(false);
        setForm({ username: "", email: "", password: "", entity_type: "user" });
      } else {
        showToast(response?.message || "Registration failed", "error");
      }
    } catch (err) {
      console.error("Register failed:", err);
      showToast(err?.message || "Unable to register", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (entity_id, entity_type) => {
    console.log(entity_id, entity_type)
    setDeletingUserId(entity_id);
    setDeletingEntityType(entity_type)
    setShowDeleteModal(true);
    };

  const performDelete = async() => {
    if (!deletingUserId && !deletingEntityType) return ;
    setIsDeleting(true)
    try{
      const response = await deleteEntityApi(
        token,
        {
          entity_id: deletingUserId,
          entity_type: deletingEntityType
        }
      )
      if (response.success){
          await fetchUsers();
          showToast("Entity deleted successfully.", "success");
      }else{
          showToast(response.message || "Failed to delete entity.", "error");
      }
    }catch(error){
      console.error("Delete failed:", error);
      showToast(error.message || "Failed to delete entity.", "error");
    }finally {
        setShowDeleteModal(false);
        setDeletingUserId(null);
        setDeletingEntityType(null)
        setIsDeleting(false);
    }
  }

  const capitalize = (str="") => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <div className="table_main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div className="table_title">Manage Users</div>
          <div>View, Register And Remove Users From the System</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            className="table_search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // reset to page 1 when user searches
              setPage(1);
            }}
          />
          <button
            className="table_add_btn"
            onClick={() => {
              setShowAddForm(prev => !prev);
              // scroll to form after rendering it
              setTimeout(() => {
                if (addFormRef.current) addFormRef.current.scrollIntoView({ behavior: "smooth" });
              }, 120);
            }}
          >
            {showAddForm ? "Close Form" : "Register User"}
          </button>
        </div>
      </div>

      <div className="table_list_card">
        {loading ? (
          <div style={{ padding: 20 }}>Loading users…</div>
        ) : (
          <>
            <table className="table_table" role="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ width: 170 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 20, color: "#6b7280" }}>No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>{(capitalize(u.username) || "").toString()}</td>
                      <td>{(capitalize(u.email) || "").toString()}</td>
                      <td>{(capitalize(u.users_type) || "").toString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* If you'd later add edit — keep placeholder */}
                          <button
                            className="table_action_btn table_btn_delete"
                            onClick={() => confirmDelete(Number(u.user_id), u.users_type)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="table_pagination" style={{ marginTop: 18 }}>
              <button className="pagination_btn" onClick={goPrev} disabled={page <= 1}>
                Previous
              </button>

              <div style={{ alignSelf: "center", fontSize: 13, color: "#374151" }}>Page {page}</div>

              <button className="pagination_btn" onClick={goNext} disabled={!hasMore}>
                Next
              </button>

              <select
                title="select limit"
                className="table_limit"
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value) || 10;
                  setLimit(newLimit);
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Register form */}
      {showAddForm && (
        <form ref={addFormRef} className="manage_recipe_form" onSubmit={submitRegister}>
          <h3>Register Entity</h3>
          <div className="manage_recipe_form_group">
            <label>Username *</label>
            <input
              className="manage_recipe_input"
              value={form.username}
              onChange={(e) => updateFormField("username", e.target.value)}
              placeholder="username"
            />
          </div>

          <div className="manage_recipe_form_group" style={{ marginBottom: 10 }}>
            <label>Email *</label>
            <input
              className="manage_recipe_input"
              value={form.email}
              onChange={(e) => updateFormField("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="manage_recipe_form_group" style={{ marginBottom: 10 }}>
            <label>Password *</label>
            <input
              type="password"
              className="manage_recipe_input"
              value={form.password}
              onChange={(e) => updateFormField("password", e.target.value)}
              placeholder="password"
            />
          </div>

          <div className="manage_recipe_form_group" style={{ marginBottom: 10 }}>
            <label>Entity type *</label>
            <select
              value={form.entity_type}
              onChange={(e) => updateFormField("entity_type", e.target.value)}
              className="manage_recipe_input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginTop: 18 }}>
            <button type="submit" className="manage_recipe_submit_btn" disabled={submitting}>
              {submitting ? "Registering…" : "Register"}
            </button>
          </div>
        </form>
      )}

      {/* Delete modal (kept for future) */}
      {showDeleteModal && (
        <div className="modal_overlay" role="dialog" aria-modal="true">
          <div className="modal_box">
            <h3>Confirm delete?</h3>
            <p>Are you sure you want to permanently delete user ID <strong>{deletingUserId}</strong>?</p>
            <div className="modal_actions">
              <button 
              className="modal_cancel" 
              onClick={() => setShowDeleteModal(false)} 
              disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
              className="modal_confirm" 
              onClick={performDelete} 
              disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
