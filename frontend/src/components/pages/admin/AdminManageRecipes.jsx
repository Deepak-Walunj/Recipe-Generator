import { useEffect, useState, useCallback, useRef } from "react";
import {addRecipe, deleteRecipe, getAllRecipes, getRecipe, getRecipeSteps, updateRecipe} from "@repositories/AdminRepo.jsx"
import { useUser } from "@components/contexts/UserContext";
import { useToast } from "@predefined/Toast.jsx"; 
import useDebounce from "@utils/useDebounce";
import { sanitizeInput } from "@utils/ApiUtils";
import '@components/pages/css/Table.css';
import '@components/pages/css/Modal.css';

export default function AdminManageRecipes() {
    const {user} = useUser();
    const {showToast} = useToast();
    const [recipe, setRecipe] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [recipeSteps, setRecipeSteps] = useState([]);
    const [newPrepTime, setNewPrepTime] = useState("");
    const [newInstruction, setNewInstruction] = useState([])
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalFetched, setTotalFetched] = useState(0);
    const [deletingRecipeId, setDeletingRecipeId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
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
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const token = user?.access_token
    const debouncedSearch = useDebounce(search, 500);

    const fetchRecipe = async(recipeId) => {
      if (!recipeId) return 
      try{
        const response = await getRecipe(token, recipeId)
        if (response.success){
          showToast("Recipe fetched successfully.", "success");
          setRecipe(response?.data?.Recipe)
        }
      } catch(error){
        console.error("Failed to fetch recipe:", error);
        showToast(error.message) || "Unable to fetch recipe."
      }
    }

    const fetchRecipes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllRecipes({
                search: debouncedSearch || null,
                page: page || 1,
                limit: limit || 10
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
    }, [page, debouncedSearch, limit]);

    useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

    const fetchRecipeSteps = async(recipeId) => {
      if (!recipeId) return;
      try{
        const response = await getRecipeSteps(
          token, recipeId
        )
        if (response.success){
          showToast("Instruction fetched successfully.", "success")
          setRecipeSteps(response?.data?.recipe_steps)
        } else{
          showToast(response.message || "Failed to fetch recipe steps.", "error")
        }
      } catch(error) {
        console.error("Failed to fetch recipe steps:", error)
        showToast(error.message || "Failed to fetch recipe steps.", "error")
      }
    }

    const goPrev = () => {
        if (page <= 1) return;
        setPage(prev => prev - 1)
    };
    const goNext = () => {
        if (!hasMore && totalFetched < limit) return;
        setPage(prev => prev + 1)
    };

    const confirmDelete = (recipeId) => {
        setDeletingRecipeId(recipeId);
        setShowDeleteModal(true);
    };

    const viewRecipe = async(recipeId) => {
      await fetchRecipe(recipeId);
      setShowViewModal(true);
    }

    const performDelete = async () => {
        if (!deletingRecipeId) return;
        setIsDeleting(true);
        try {
            const response = await deleteRecipe(token, deletingRecipeId)
            if (response.success){
                await fetchRecipes();
                showToast("Recipe deleted successfully.", "success");
            }else{
                showToast(response.message || "Failed to delete recipe.", "error");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            showToast(err.message || "Failed to delete recipe.", "error");
        } finally {
            setShowDeleteModal(false);
            setDeletingRecipeId(null);
            setIsDeleting(false);
        }
    };

    const buildInstructionString = () => {
      return newInstruction
        .map(step => step.instruction.trim())
        .filter(Boolean)
        .join("\n");
    };

    const performRecipeUpdate = async () => {
        if (!recipe.recipe_id) return;
        const instructionString = buildInstructionString();
        setIsUpdating(true);
        try{
      const response = await updateRecipe(
        token,
        recipe.recipe_id,
        {
          prep_time: newPrepTime ? newPrepTime : undefined,
          instruction: instructionString? instructionString.trim() : undefined
        }
      );
      if (response.success){
          showToast("Recipe updated successfully.", "success");
      }else{
          showToast(response.message || "Failed to update recipe.", "error");
      }
    }catch(error){
      console.error("Update failed:", error);
      showToast(error.message || "Failed to update recipe.", "error");
    }finally{
        setShowUpdateModal(false);
        setIsUpdating(false);
        setNewPrepTime(null);
        setNewInstruction([]);
        await fetchRecipes();
    }
    }

    useEffect(() =>{
      if (showUpdateModal && recipe && recipeSteps.length){
        const prep = recipe.prep_time
          ? parseInt(recipe.prep_time)
          : "";

        setNewPrepTime(prep);
        const formattedSteps = recipeSteps
          .sort((a,b) => a.step_number - b.step_number)
          .map((s) => ({
            id: s.step_id,
            step_number: s.step_number,
            instruction: s.instruction
          }))
        setNewInstruction(formattedSteps)
      }
    }, [showUpdateModal, recipe, recipeSteps])
    const openUpdateModal  = async(recipeId) => {
      await Promise.all([
        fetchRecipe(recipeId),
        fetchRecipeSteps(recipeId)]
      )
      setShowUpdateModal(true);
    }

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
        if (form.title.trim().length > 100) {
        showToast("Title must not exceed 100 characters", "error");
        return false;
        }
        if (!form.instruction.trim()) {
        showToast("Instruction is required", "error");
        return false;
        }
        if (form.instruction.trim().length > 5000) {
        showToast("Instruction must not exceed 5000 characters", "error");
        return false;
        }
        if (!form.cuisine_name.trim()) {
        showToast("Cuisine name is required", "error");
        return false;
        }
        if (form.cuisine_name.trim().length > 50) {
        showToast("Cuisine name must not exceed 50 characters", "error");
        return false;
        }
        if (form.prep_time && isNaN(Number(form.prep_time))) {
        showToast("Prep time must be a valid number", "error");
        return false;
        }
        const cleanedIngredients = form.ingredients.filter(i => i.name && i.name.trim());
        if (!cleanedIngredients.length) {
        showToast("At least one ingredient (name) is required", "error");
        return false;
        }
        for (const ingredient of cleanedIngredients) {
            if (ingredient.name.length > 100) {
                showToast("Ingredient name must not exceed 100 characters", "error");
                return false;
            }
            if (ingredient.quantity && ingredient.quantity.length > 50) {
                showToast("Ingredient quantity must not exceed 50 characters", "error");
                return false;
            }
        }
        return true;
    };

    const submitAddRecipe = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const payload = {
        title: sanitizeInput(form.title.trim()),
        instruction: sanitizeInput(form.instruction.trim()),
        prep_time: form.prep_time === "" ? null : parseInt(form.prep_time, 10) || null,
        cuisine_name: sanitizeInput(form.cuisine_name.trim()),
        ingredients: form.ingredients.filter(i => i.name && i.name.trim()).map(i => {
            return { 
                name: sanitizeInput(i.name.trim()), 
                quantity: i.quantity ? String(i.quantity).trim() : undefined, 
                unit: sanitizeInput(i.unit.trim()) 
            };
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
    const formatInstruction = (text = '') => {
      return text
        .split('\n')
        .map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return ""
          const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          return `${index+1}. ${capitalized}`;
        }).join('\n');
    }
    const updateStepInstruction = ( index, value ) => {
      setNewInstruction(prev => {
        const updated = [...prev];
        updated[index] = {...updated[index], instruction: value};
        console.log("Updated instruction:", updated)
        return updated;
      })
    }

    const originalInstructionString = recipeSteps
      .sort((a,b)=>a.step_number-b.step_number)
      .map(s => s.instruction.trim())
      .join("\n");
    const editedInstructionString = Array.isArray(newInstruction)
      ? buildInstructionString()
      : "";
    const nothingChanged = editedInstructionString === originalInstructionString && parseInt(newPrepTime) === parseInt(recipe?.prep_time);

  const moveStepUp = (index) => {
    if (index === 0) return;
    setNewInstruction((items) => {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems.map((step, idx) => ({
        ...step,
        step_number: idx + 1
      }));
    });
  };

  const moveStepDown = (index) => {
    if (index === newInstruction.length - 1) return;
    setNewInstruction((items) => {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems.map((step, idx) => ({
        ...step,
        step_number: idx + 1
      }));
    });
  };   
    return (
    <div className="table_main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div className="table_title">Manage Recipes</div>
          <div className="table_subtitle">View, Create And Remove Recipes From The System.</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            className="table_search"
            placeholder="Search recipes by title or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="table_add_btn"
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

      <div className="table_list_card">
        {loading ? (
          <div style={{ padding: 20 }}>Loading recipes…</div>
        ) : (
          <>
            <table className="table_table" role="table">
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
                    <td>
                      <div className="instruction_cell">
                        {truncate(formatInstruction(r.instruction) || "", 140)}
                        <div className="instruction_tooltip">
                          {formatInstruction(r.instruction)}
                        </div>
                      </div>
                    </td>
                    <td>{r.prep_time || "-"}</td>
                    <td>{capitalize(r.cuisine_name) || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                         className="table_action_btn table_btn_view"
                         onClick={() => {
                            viewRecipe(Number(r.recipe_id));
                         }}
                        >
                          View
                        </button>
                        <button
                          className="table_action_btn table_btn_delete"
                          onClick={() => confirmDelete(Number(r.recipe_id))}
                        >
                          Delete
                        </button>
                        <button
                          className="table_action_btn table_btn_update"
                          onClick={() => {
                            openUpdateModal (Number(r.recipe_id));
                          }}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* pagination */}
            <div className="table_pagination" style={{ marginTop: 18 }}>
              <button 
              className="pagination_btn" 
              onClick={goPrev} 
              disabled={page <= 1}
              >
                Previous
              </button>
              <div style={{ alignSelf: "center", fontSize: 13, color: "#374151" }}>Page {page}</div>
              <button
                className="pagination_btn"
                onClick={goNext}
                disabled={recipes.length < limit}
              >
                Next
              </button>
              <select 
              title="select limit"
              className="table_limit" 
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
                  <button type="button" className="table_add_btn" onClick={addIngredientRow}>
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

      {/* View Recipe Modal */}
      {showViewModal && recipe && (
        <div className="modal_overlay" role="dialog" aria-modal="true">
          <div className="recipe_view_modal_box">
            <h3>{capitalize(recipe.title)}</h3>
            <div>
              <div className="field readonly">
                <label >Id: </label>
                <span>{recipe.recipe_id}</span>
              </div>
              <div className="field readonly">
                <label >Instructions:</label>
                <span>{formatInstruction(recipe.instruction)}</span>
              </div>
              <div className="field readonly">
                <label >Preparation Time: </label>
                <span>{recipe.prep_time || "-"}</span>
              </div>
              <div className="field readonly">
                <label >Cuisine</label>
                <span>{capitalize(recipe.cuisine_name) || "-"}</span>
              </div>
              <div className="field readonly">
                <label >Total Views: </label>
                <span>{recipe.views || "-"}</span>
              </div>
              <div className="field readonly">
                <label >Bookmark Count: </label>
                <span>{recipe.no_of_bookmarks || "-"}</span>
              </div>
            </div>
            <div className="modal_actions">
              <button 
                className="modal_back"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && recipe && recipeSteps.length && (
        <div className="modal_overlay" role="dialog" aria-modal="true">
          <div className="modal_box">
            <h3>{capitalize(recipe.title)}</h3>
            <div className="user_fields">
              <div className="field readonly">
                <label >Id: </label>
                <span>{recipe.recipe_id}</span>
                <span className="lock"></span>
              </div>
              <div className="field readonly">
                <label >Cuisine</label>
                <span>{capitalize(recipe.cuisine_name) || "-"}</span>
              </div>
              <div className="field editable">
                <label >Preparation Time: </label>
                <input 
                  type="text" 
                  value={newPrepTime}
                  style={{textAlign:"center"}}
                  placeholder={recipe.prep_time || "N/A"}
                  onChange={(e) => setNewPrepTime(e.target.value)}
                />
              </div>
              <div className="field editable">
                <label >Instructions:</label>
                <table className="table_table" style={{marginTop:10}}>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Step</th>
                      <th>Instruction</th>
                    </tr>
                  </thead>

                  <tbody>
                    {newInstruction.map((step, index) => (
                      <tr key={step.id}>
                        
                        {/* Step number column */}
                        <td style={{fontWeight:600, textAlign:"center"}}>
                          {index + 1}
                        </td>

                        {/* Instruction column */}
                        <td>
                          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                            
                            <textarea
                              className="manage_recipe_textarea manage_recipe_input"
                              value={capitalize(step.instruction)}
                              style={{height:80, flex:1}}
                              onChange={(e) => updateStepInstruction(index, e.target.value)}
                            />

                            {/* arrows on right */}
                            <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                              <button
                                type="button"
                                onClick={() => moveStepUp(index)}
                                disabled={index === 0}
                                className="step_move_btn"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                onClick={() => moveStepDown(index)}
                                disabled={index === newInstruction.length - 1}
                                className="step_move_btn"
                              >
                                ↓
                              </button>
                            </div>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          <div className="modal_actions">
            <button
            className="modal_cancel"
            onClick={() => setShowUpdateModal(false)}
            disabled={isUpdating}
            >
              Cancel
            </button>
            <button
            className="modal_confirm"
            onClick={performRecipeUpdate}
            disabled={isUpdating || nothingChanged}
            >
              {isUpdating ? "Updating…": "Update"}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
