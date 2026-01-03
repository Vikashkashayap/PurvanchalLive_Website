import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { Heading } from '@tiptap/extension-heading';
import { Youtube } from '@tiptap/extension-youtube';
import { useCallback, useRef, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'यहाँ अपना सामग्री लिखें...',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg cursor-pointer',
          style: 'max-width: 100%; height: auto;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        controls: true,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Editor content updated, HTML length:', html.length);
      onChange(html);
    },
    onCreate: () => {
      console.log('RichTextEditor initialized with content length:', content.length);
      console.log('Content preview:', content.substring(0, 200));
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-lg resize-y font-["Noto_Sans_Devanagari"]',
        placeholder,
      },
    },
  });

  const addImage = useCallback(() => {
    if (fileInputRef.current) {
      console.log('Opening file picker for image upload');
      fileInputRef.current.click();
    } else {
      console.error('File input ref not available');
    }
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) {
      console.warn('No file selected or editor not available');
      return;
    }

    // Check file size (5MB limit to match backend)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('इमेज बहुत बड़ी है। अधिकतम 5MB की अनुमति है।');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('केवल इमेज फाइलें अनुमत हैं।');
      return;
    }

    console.log('Processing image upload:', file.name, file.size, 'bytes');
    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        console.log('Image loaded as base64, inserting into editor...');
        console.log('Base64 data length:', result.length, 'characters');
        editor.chain().focus().setImage({ src: result }).run();
        console.log('Image inserted successfully');
      } catch (error) {
        console.error('Error inserting image:', error);
        alert('इमेज डालने में त्रुटि हुई।');
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('फाइल पढ़ने में त्रुटि हुई।');
      setIsUploadingImage(false);
    };

    reader.readAsDataURL(file);

    // Reset input after starting the read operation
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;

    const url = prompt('YouTube वीडियो URL दर्ज करें:');
    if (url) {
      // Extract video ID from various YouTube URL formats
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        editor.chain().focus().setYoutubeVideo({
          src: `https://www.youtube.com/embed/${videoId}`,
        }).run();
      } else {
        alert('अमान्य YouTube URL। कृपया सही URL दर्ज करें।');
      }
    }
  }, [editor]);

  if (!editor) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="बोल्ड (Ctrl+B)"
          disabled={disabled}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="इटैलिक (Ctrl+I)"
          disabled={disabled}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          title="अंडरलाइन (Ctrl+U)"
          disabled={disabled}
        >
          <u>U</u>
        </button>

        {/* Headings */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          title="शीर्षक 1"
          disabled={disabled}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="शीर्षक 2"
          disabled={disabled}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="शीर्षक 3"
          disabled={disabled}
        >
          H3
        </button>

        {/* Lists */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="बुलेट सूची"
          disabled={disabled}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="क्रमांकित सूची"
          disabled={disabled}
        >
          1.
        </button>

        {/* Color and Highlight */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          title="पाठ का रंग"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
          title="हाइलाइट"
          disabled={disabled}
        >
          🖍️
        </button>

        {/* Media */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={addImage}
          className={`p-2 rounded hover:bg-gray-200 ${isUploadingImage ? 'bg-blue-100' : ''}`}
          title={isUploadingImage ? 'इमेज अपलोड हो रहा है...' : 'इमेज डालें'}
          disabled={disabled || isUploadingImage}
        >
          {isUploadingImage ? '⏳' : '🖼️'}
        </button>
        <button
          type="button"
          onClick={addYoutubeVideo}
          className="p-2 rounded hover:bg-gray-200"
          title="YouTube वीडियो डालें"
          disabled={disabled}
        >
          📺
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('लिंक URL दर्ज करें:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="लिंक जोड़ें"
          disabled={disabled}
        >
          🔗
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] [&_p]:leading-normal [&_p]:mb-1 [&_ul]:mb-1 [&_ol]:mb-1 [&_li]:mb-1 [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 **:leading-normal"
      />

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleImageUpload}
        className="hidden"
        multiple={false}
      />
    </div>
  );
};

export default RichTextEditor;
