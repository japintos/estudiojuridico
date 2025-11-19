import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escriba el contenido de la plantilla...',
  className = ''
}: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['8pt', '10pt', '12pt', '14pt', '16pt', '18pt', '24pt', '36pt'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'line-height': ['1.0', '1.5', '2.0', '2.5'] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), [])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'line-height',
    'blockquote', 'code-block',
    'link'
  ]

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
        }}
      />
    </div>
  )
}

