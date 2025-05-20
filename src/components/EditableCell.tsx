import { memo } from 'react'

interface EditableCellProps {
  value: string | number | File | null
  onChange: (value: any) => void
  onSave?: () => void
  type?: 'text' | 'number' | 'date' | 'file' | 'select'
  options?: { label: string; value: string }[] // untuk select
}

function EditableCellComponent({
  value,
  onChange,
  onSave,
  type = 'text',
  options = [],
}: EditableCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' && onSave) {
      onSave()
    }
  }

  const handleBlur = () => {
    if (onSave) {
      onSave()
    }
  }

  if (type === 'select') {
    return (
      <select
        className="border p-1 w-full"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <option value="">-- Pilih --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'file') {
    return (
      <input
        className="border p-1 w-full"
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    )
  }

  return (
    <input
      className="border p-1 w-full"
      type={type}
      value={type === 'number' ? Number(value) : (value as string)}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}

const EditableCell = memo(EditableCellComponent)
export default EditableCell
