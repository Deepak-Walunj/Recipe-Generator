import { useEffect, useState, useCallback, useRef } from "react";
import {addRecipe, deleteRecipe} from "@repositories/AdminRepo.jsx"
import {getAllRecipes} from "@repositories/PublicRepo.jsx"
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx"; 
import '@components/pages/css/Recipes.css';
import '@components/pages/css/Modal.css';

export default function AdminManageRecipes() {
    const {user} = useUser();
    const {showToast} = useToast();
    const [recipes, setRecipes] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalFetched, setTotalFetched] = useState(0);
    
    const [deletingRecipeId, setDeletingRecipeId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const addFormRef = useRef(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        instruction: "",
        prep_time: "", 
        cuisine_name: "",
        ingredients: [{ name: "", quantity: "", unit: "" }],
    });
    const [submitting, setSubmitting] = useState(false);
    const token = user?.access_token
    const fetchRecipes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllRecipes({
                search: search || null,
                page,
                limit
            });
            if (response.success) {
                const payload = response.data; // {page, limit, recipes}
                const recipesList = payload.recipes || [];
                setRecipes(recipesList);
                setTotalFetched(recipesList.length);
                setHasMore(recipesList.length === Number(payload.limit));
                setPage(Number(payload.page));
            } else {
                showToast(response.message || "Failed to fetch recipes", "error");
            }
        } catch (err) {
            console.error("Failed to fetch recipes:", err);
            showToast(err.message || "Unable to fetch recipes.", "error");
        } finally {
            setLoading(false);
        }
    }, [page, search, limit]);


    useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

    const goPrev = () => {
        if (page <= 1) return;
        setPage(page-1)
    };
    const goNext = () => {
        if (!hasMore && totalFetched < limit) return;
        setPage(page+1)
    };

    const confirmDelete = (recipeId) => {
        setDeletingRecipeId(recipeId);
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        if (!deletingRecipeId) return;
        setIsDeleting(true);
        try {
            const response = await deleteRecipe(token, deletingRecipeId)
            if (response.success){
                await fetchRecipes();
                showToast("Recipe deleted successfully.", "success");
            }else{
                showToast(response.message || "Failed to fetch admin profile.", "error");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            showToast(err.message || "Failed to fetch admin profile.", "error");
        } finally {
            setShowDeleteModal(false);
            setDeletingRecipeId(null);
            setIsDeleting(false);
        }
    };

    // add recipe form handlers
    const updateFormField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateIngredient = (index, key, value) => {
        setForm(prev => {
        const ing = [...prev.ingredients];
        ing[index] = { ...ing[index], [key]: value };
        return { ...prev, ingredients: ing };
        });
    };

    const addIngredientRow = () => {
        setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: "", quantity: "" }] }));
    };

    const removeIngredientRow = (index) => {
        setForm(prev => {
        const ing = prev.ingredients.filter((_, i) => i !== index);
        return { ...prev, ingredients: ing.length ? ing : [{ name: "", quantity: "" }] };
        });
    };

    const validateForm = () => {
        if (!form.title.trim()) {
        showToast("Title is required", "error");
        return false;
        }
        if (!form.instruction.trim()) {
        showToast("Instruction is required", "error");
        return false;
        }
        if (!form.cuisine_name.trim()) {
        showToast("Cuisine name is required", "error");
        return false;
        }
        const cleanedIngredients = form.ingredients.filter(i => i.name && i.name.trim());
        if (!cleanedIngredients.length) {
        showToast("At least one ingredient (name) is required", "error");
        return false;
        }
        return true;
    };

    const submitAddRecipe = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const payload = {
        title: form.title.trim(),
        instruction: form.instruction.trim(),
        prep_time: form.prep_time === "" ? null : parseInt(form.prep_time, 10) || null,
        cuisine_name: form.cuisine_name.trim(),
        ingredients: form.ingredients.filter(i => i.name && i.name.trim()).map(i => {
            return { name: i.name.trim(), quantity: i.quantity ? String(i.quantity).trim() : undefined, unit: i.unit.trim() };
            }),
        };
        setSubmitting(true);
        try {
            const response = await addRecipe(token, payload) 
            if (response.success){
                showToast("Recipe added successfully.", "success");
                await fetchRecipes();
                setShowAddForm(false);
                setForm({ title: "", instruction: "", prep_time: "", cuisine_name: "", ingredients: [{ name: "", quantity: "", unit: "" }] });
            }else{
                showToast(response.message || "Failed to fetch admin profile.", "error");
            }
        } catch (err) {
            console.error("Add recipe failed:", err);
            showToast(err.message || "Unable to add recipe.", "error");
        } finally {
        setSubmitting(false);
        }
    };
    const capitalize = (str="") => str.charAt(0).toUpperCase() + str.slice(1)
    const truncate = (txt, n = 120) => (txt && txt.length > n ? txt.slice(0, n) + "…" : txt);
  return (
    <div className="manage_recipes_main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div className="manage_recipes_title">Manage Recipes</div>
          <div className="manage_recipes_subtitle">View, create and remove recipes from the system.</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            className="manage_recipes_search"
            placeholder="Search recipes by title or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="manage_recipes_add_btn"
            onClick={() => {
                setShowAddForm(prev => !prev);
                setTimeout(() => {
                    if(addFormRef.current){
                        addFormRef.current.scrollIntoView({behavior: "smooth"})
                    }
                }, 100)
            }
            }
          >
            {showAddForm ? "Close Form" : "Add Recipe"}
          </button>
        </div>
      </div>

      <div className="manage_recipes_list_card">
        {loading ? (
          <div style={{ padding: 20 }}>Loading recipes…</div>
        ) : (
          <>
            <table className="manage_recipes_table" role="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>ID</th>
                  <th>Title</th>
                  <th>Instruction</th>
                  <th>Prep time</th>
                  <th>Cuisine</th>
                  <th style={{ width: 170 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 20, color: "#6b7280" }}>No recipes found.</td>
                  </tr>
                ) : recipes.map((r) => (
                  <tr key={r.recipe_id }>
                    <td>{r.recipe_id}</td>
                    <td style={{ fontWeight: 600 }}>{(capitalize(r.title) || "").toString()}</td>
                    <td>{truncate(capitalize(r.instruction) || "", 140)}</td>
                    <td>{r.prep_time || "-"}</td>
                    <td>{capitalize(r.cuisine_name) || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {/* If you'd later add edit — keep placeholder */}
                        <button
                          className="recipe_action_btn recipe_btn_delete"
                          onClick={() => confirmDelete(Number(r.recipe_id))}
                        >
                          Delete
                        </button>
                        {/* Potential future button */}
                        {/* <button className="recipe_action_btn">Edit</button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* pagination */}
            <div className="manage_recipes_pagination" style={{ marginTop: 18 }}>
              <button className="pagination_btn" onClick={goPrev} disabled={page <= 1}>
                Previous
              </button>
              <div style={{ alignSelf: "center", fontSize: 13, color: "#374151" }}>Page {page}</div>
              <button
                className={`pagination_btn`}
                onClick={goNext}
                disabled={recipes.length < limit}
              >
                Next
              </button>
              <select 
              title={"select limit"}
              placeholder="select limit"
              className="manage_recipes_limit" 
              value={limit} 
              onChange={(e) => {setLimit(e.target.value); setPage(1)}}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
            </select>
            </div>
          </>
        )}

        {/* Add recipe form */}
        {showAddForm && (
          <form ref={addFormRef} className="manage_recipe_form" onSubmit={submitAddRecipe}>
            <h3>Add New Recipe</h3>
            <div className="manage_recipe_form_group">
              <label>Title *</label>
              <input
                className="manage_recipe_input"
                value={form.title}
                onChange={e => updateFormField("title", e.target.value)}
                placeholder="e.g. Spicy Paneer Stir-fry"
              />
            </div>
            <div className="manage_recipe_form_group">
              <label>Instruction *</label>
              <textarea
                className="manage_recipe_textarea manage_recipe_input"
                value={form.instruction}
                onChange={e => updateFormField("instruction", e.target.value)}
                placeholder="Preparation steps..."
              />
            </div>
            <div className="manage_recipe_form_group" style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Prep time (mins)</label>
                <input
                  type="number"
                  min="0"
                  className="manage_recipe_input"
                  value={form.prep_time}
                  onChange={e => updateFormField("prep_time", e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Cuisine name *</label>
                <input
                  className="manage_recipe_input"
                  value={form.cuisine_name}
                  onChange={e => updateFormField("cuisine_name", e.target.value)}
                  placeholder="e.g. North-Indian"
                />
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ingredients *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8 }}>
                    <input
                      className="manage_recipe_input"
                      style={{ flex: 2 }}
                      placeholder="Ingredient name (e.g. tomato)"
                      value={ing.name}
                      onChange={e => updateIngredient(idx, "name", e.target.value)}
                    />
                    <input
                      className="manage_recipe_input"
                      style={{ flex: 1 }}
                      placeholder="Quantity (optional)"
                      value={ing.quantity}
                      onChange={e => updateIngredient(idx, "quantity", e.target.value)}
                    />
                    <input
                      className="manage_recipe_input"
                      style={{ flex: 1 }}
                      placeholder="Unit (optional)"
                      value={ing.unit}
                      onChange={e => updateIngredient(idx, "unit", e.target.value)}
                    />
                    <button
                      type="button"
                      className="recipe_action_btn"
                      style={{ background: "#ef4444", color: "white" }}
                      onClick={() => removeIngredientRow(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div>
                  <button type="button" className="manage_recipes_add_btn" onClick={addIngredientRow}>
                    + Add ingredient
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="manage_recipe_submit_btn" type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save Recipe"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="modal_overlay" role="dialog" aria-modal="true">
          <div className="modal_box">
            <h3>Confirm delete?</h3>
            <p>Are you sure you want to permanently delete recipe ID <strong>{deletingRecipeId}</strong>? This action cannot be undone.</p>
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
