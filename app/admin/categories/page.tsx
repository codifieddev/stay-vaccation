"use client";
import React, { useState } from "react";
import { Card, Btn, Ic, cls, CategoryForm, Category } from "../../components/AdminCore";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { createCategory, updateCategory, deleteCategory } from "@/app/store/features/categories/categoryThunks";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.categories);
  const { packages } = useAppSelector(state => state.packages);
  
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async (data: Category) => {
    try {
      const isNew = !data._id;
      if (isNew) {
        dispatch(createCategory(data));
      } else {
        dispatch(updateCategory(data));
      }
      setEditing(null);
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    dispatch(deleteCategory(id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Manage categories displayed on the website homepage</p>
        </div>
        <Btn variant="primary" onClick={() => setIsCreating(true)}>
          <Ic.Plus /> Add New Category
        </Btn>
      </div>

      {(editing || isCreating) && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Lock body scroll */}
          <style jsx global>{`body { overflow: hidden !important; }`}</style>
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg">
                {isCreating ? "Create New Category" : "Edit Category"}
              </h3>
              <button onClick={() => { setEditing(null); setIsCreating(false); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <Ic.Close />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <CategoryForm 
                initial={editing || { name: "", slug: "", icon: "Beach", color: "from-cyan-400 to-blue-500", gradient: "from-cyan-400 to-blue-500", image: "", link: "", order: 0, description: "", isActive: true }} 
                onSave={handleSave} 
                onCancel={() => { setEditing(null); setIsCreating(false); }} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...categories].sort((a, b) => a.order - b.order).map((cat) => (
          <Card key={cat._id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
            <div className={cls("h-24 bg-gradient-to-br flex items-center justify-center text-white relative", !cat.image && (cat.color || cat.gradient))}>
              {cat.image ? (
                <>
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                </>
              ) : (
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              )}
              <div className="relative z-10 scale-110 group-hover:scale-125 transition-transform duration-500 opacity-90 text-4xl">
                {cat.icon || <Ic.Tag />}
              </div>
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                  Order: {cat.order}
                </div>
                <div className={cls("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", cat.isActive ? "bg-emerald-400/80 text-emerald-950" : "bg-red-400/80 text-red-950")}>
                  {cat.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cat.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{cat.link}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {packages.filter(p => p.categoryId === cat._id).length} Packages
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => setEditing(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Category">
                    <Ic.Edit />
                  </button>
                  <button onClick={() => handleDelete(cat._id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Category">
                    <Ic.Trash />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{cat.description || "No description added."}</p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Icon:</span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{cat.icon}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Ic.Tag />
          </div>
          <p className="text-gray-500 font-medium">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first category to see it on the homepage</p>
          <Btn variant="primary" className="mt-6" onClick={() => setIsCreating(true)}>
            Add Category
          </Btn>
        </div>
      )}
    </div>
  );
}
