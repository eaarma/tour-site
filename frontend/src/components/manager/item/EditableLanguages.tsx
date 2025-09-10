"use client";

import { useState } from "react";

const LANGUAGE_OPTIONS = [
  "English",
  "Estonian",
  "Russian",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Finnish",
  "Swedish",
  "Chinese",
  "Japanese",
];

interface EditableLanguagesProps {
  value: string[];
  onChange: (langs: string[]) => void;
  isEditing: boolean;
}

export default function EditableLanguages({
  value,
  onChange,
  isEditing,
}: EditableLanguagesProps) {
  const [selected, setSelected] = useState("");

  const handleAdd = () => {
    if (selected && !value.includes(selected)) {
      onChange([...value, selected]);
      setSelected("");
    }
  };

  const handleRemove = (lang: string) => {
    onChange(value.filter((l) => l !== lang));
  };

  return (
    <div>
      {/* Language bubbles */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((lang) => (
          <span
            key={lang}
            className="badge badge-outline flex items-center gap-1"
          >
            {lang}
            {isEditing && (
              <button
                type="button"
                className="ml-1 text-xs text-error"
                onClick={() => handleRemove(lang)}
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Dropdown only in edit mode */}
      {isEditing && (
        <div className="flex gap-2">
          <select
            className="select select-bordered flex-1"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a language</option>
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} disabled={value.includes(opt)}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
