import React, { useRef, useState, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaTimes,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaUndo,
  FaImage,
  FaTrash,
} from "react-icons/fa";
import axiosInstance from "../../utils/baseUrl";

interface CustomTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const CustomTextEditor: React.FC<CustomTextEditorProps> = ({
  value,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState("Normal");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null
  );

  const colors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#EE82EE",
    "#000000",
    "#FFFFFF",
    "#808080",
  ];

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .editor-body ul, .editor-body ol {
        display: block;
        padding-left: 20px;
        margin-left: 0;
      }
      
      /* Override default list display */
      .editor-body ul li, .editor-body ol li {
        display: list-item;
        text-align: inherit;
      }
      
      /* Alignment styles */
      .editor-body div[style*="text-align: center"], 
      .editor-body p[style*="text-align: center"] {
        text-align: center !important;
      }
      
      .editor-body div[style*="text-align: right"],
      .editor-body p[style*="text-align: right"] {
        text-align: right !important;
      }
      
      /* Container alignments for lists */
      .editor-body div[style*="text-align: center"] ul,
      .editor-body div[style*="text-align: center"] ol,
      .editor-body p[style*="text-align: center"] ul,
      .editor-body p[style*="text-align: center"] ol {
        display: inline-block;
        text-align: left;
        margin: 0 auto;
      }
      
      .editor-body div[style*="text-align: right"] ul,
      .editor-body div[style*="text-align: right"] ol,
      .editor-body p[style*="text-align: right"] ul,
      .editor-body p[style*="text-align: right"] ol {
        display: inline-block;
        text-align: left;
        margin-left: auto;
      }
      
      /* Base list spacing */
      .editor-body ol, .editor-body ul {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      /* Break list styling */
      .editor-body .list-break {
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        text-align: left;
      }
      
      /* Image styling */
      .editor-body img {
        max-width: 100%;
        height: auto;
        margin: 8px 0;
        cursor: pointer;
      }
      
      .editor-body img.selected {
        outline: 2px solid #007bff;
      }
      
      /* Drag over highlight */
      .editor-body.drag-over {
        border: 2px dashed #007bff;
        background-color: rgba(0, 123, 255, 0.05);
      }
      
      /* Image upload overlay */
      .image-upload-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .image-upload-progress {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        text-align: center;
      }
      
      /* Image toolbar */
      .image-toolbar {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10;
        display: flex;
        gap: 5px;
      }
      
      .image-toolbar button {
        padding: 5px;
        border: none;
        background: none;
        cursor: pointer;
        color: #333;
      }
      
      .image-toolbar button:hover {
        background: #f0f0f0;
        border-radius: 3px;
      }
      
      /* Editor container needs relative positioning for overlay */
      .editor-container {
        position: relative;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle key events for specific cases
  useEffect(() => {
    const editor = editorRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          // Check if we're in a list
          const range = selection.getRangeAt(0);
          let listItem = range.commonAncestorContainer;

          while (
            listItem &&
            listItem.nodeName !== "LI" &&
            listItem.nodeName !== "DIV"
          ) {
            listItem = listItem.parentNode as Node;
          }

          if (listItem && listItem.nodeName === "LI") {
            // Create a new paragraph after the list
            const newParagraph = document.createElement("p");
            newParagraph.style.textAlign = "left";
            newParagraph.innerHTML = "<br>";

            // Find the parent list
            const list = listItem.parentNode as Node;
            const listParent = list.parentNode as Node;

            // Insert the new paragraph after the list
            if (listParent && listParent.insertBefore && list.nextSibling) {
              listParent.insertBefore(newParagraph, list.nextSibling);
            } else if (listParent && listParent.appendChild) {
              listParent.appendChild(newParagraph);
            }

            // Place cursor in the new paragraph
            range.selectNodeContents(newParagraph);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            // Update the editor content
            handleInput();
          }
        }
      }

      // Handle Delete key when an image is selected
      if ((e.key === "Delete" || e.key === "Backspace") && selectedImage) {
        e.preventDefault();
        removeSelectedImage();
      }
    };

    if (editor) {
      editor.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    const editor = editorRef.current;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (editor && !editor.classList.contains("drag-over")) {
        editor.classList.add("drag-over");
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (editor) {
        editor.classList.remove("drag-over");
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (editor) {
        editor.classList.remove("drag-over");

        // Get dropped files
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          await handleImageFiles(files);
        }
      }
    };

    if (editor) {
      editor.addEventListener("dragover", handleDragOver);
      editor.addEventListener("dragleave", handleDragLeave);
      editor.addEventListener("drop", handleDrop);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("dragover", handleDragOver);
        editor.removeEventListener("dragleave", handleDragLeave);
        editor.removeEventListener("drop", handleDrop);
      }
    };
  }, []);

  // Setup click listeners for image selection
  useEffect(() => {
    const editor = editorRef.current;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (selectedImage) {
        selectedImage.classList.remove("selected");
        setSelectedImage(null);
      }

      if (target.tagName === "IMG") {
        target.classList.add("selected");
        setSelectedImage(target as HTMLImageElement);
      }
    };

    if (editor) {
      editor.addEventListener("click", handleClick);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("click", handleClick);
      }
    };
  }, [selectedImage]);

  const handleFormat = (command: string, value?: string) => {
    // Special handling for lists to maintain alignment
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      // Check if we need to remove a list
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let listItem = range.commonAncestorContainer;

        // Find if we're in a list item
        while (listItem && listItem.nodeName !== "LI" && listItem.parentNode) {
          listItem = listItem.parentNode as Node;
        }

        // If we're already in a list of the same type, this command will remove it
        if (listItem && listItem.nodeName === "LI") {
          const parentList = listItem.parentNode;
          const isOrdered = parentList?.nodeName === "OL";

          // Check if the command would remove the current list type
          if (
            (isOrdered && command === "insertOrderedList") ||
            (!isOrdered && command === "insertUnorderedList")
          ) {
            // Execute the command which will remove the list
            document.execCommand(command, false, value);

            // Get the current text alignment
            const parentElement = parentList?.parentNode as HTMLElement;
            if (parentElement) {
              const style = window.getComputedStyle(parentElement);
              const textAlign = style.textAlign;

              // Re-apply the text alignment
              if (textAlign === "center") {
                document.execCommand("justifyCenter", false);
              } else if (textAlign === "right") {
                document.execCommand("justifyRight", false);
              }
            }

            handleInput();
            return;
          }
        }

        // Get current alignment if any
        const parentElement = range.commonAncestorContainer.parentElement;
        let currentAlign = "left";

        if (parentElement) {
          const style = window.getComputedStyle(parentElement);
          currentAlign = style.textAlign;
        }

        // Execute the list command
        document.execCommand(command, false, value);

        // After creating list, apply the alignment to the list container
        if (currentAlign !== "left") {
          // Find the newly created list
          const newListItem = selection.anchorNode;
          if (newListItem) {
            let listParent = newListItem.parentNode;
            while (
              listParent &&
              listParent.nodeName !== "UL" &&
              listParent.nodeName !== "OL" &&
              listParent.parentNode
            ) {
              listParent = listParent.parentNode;
            }

            if (listParent && listParent.parentNode) {
              // Apply the alignment to the list container
              const container = listParent.parentNode as HTMLElement;
              if (currentAlign === "center") {
                container.style.textAlign = "center";
              } else if (currentAlign === "right") {
                container.style.textAlign = "right";
              }
            }
          }
        }
      } else {
        document.execCommand(command, false, value);
      }
    } else {
      document.execCommand(command, false, value);
    }

    handleInput();
  };

  // Add a method for exiting list and resetting alignment
  const exitList = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let listItem = range.commonAncestorContainer;

    // Find if we're in a list item
    while (listItem && listItem.nodeName !== "LI" && listItem.parentNode) {
      listItem = listItem.parentNode as Node;
    }

    if (listItem && listItem.nodeName === "LI") {
      // Create a break point
      const breakDiv = document.createElement("div");
      breakDiv.className = "list-break";
      breakDiv.innerHTML = "<br>";

      // Insert after the list
      const list = listItem.parentNode as Node;
      const listParent = list.parentNode as Node;

      if (listParent.nextSibling) {
        listParent.parentNode?.insertBefore(breakDiv, listParent.nextSibling);
      } else {
        listParent.parentNode?.appendChild(breakDiv);
      }

      // Place cursor in the new div
      range.selectNodeContents(breakDiv);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      handleInput();
    }
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedHeading(selectedValue);
    handleFormat(
      "formatBlock",
      selectedValue === "Normal" ? "p" : selectedValue
    );
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      handleFormat("createLink", linkInput);
      setLinkInput("");
      setShowLinkInput(false);
    }
  };

  const handleCancelLink = () => {
    setLinkInput("");
    setShowLinkInput(false);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    handleFormat("foreColor", color);
    setShowColorPicker(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      fixListAlignment(editorRef.current);
      onChange(editorRef.current.innerHTML);
    }
  };

  const fixListAlignment = (element: HTMLElement) => {
    const lists = element.querySelectorAll("ul, ol");
    lists.forEach((list) => {
      const parent = list.parentElement as HTMLElement | null;
      const listElement = list as HTMLElement;

      if (parent) {
        const style = window.getComputedStyle(parent);
        const textAlign = style.textAlign;

        if (textAlign === "center" || textAlign === "right") {
          parent.style.textAlign = textAlign;

          listElement.style.display = "inline-block";
          listElement.style.textAlign = "left";
          listElement.style.margin =
            textAlign === "center" ? "0 auto" : "0 0 0 auto";
        }
      }
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      if (e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              handleImageFiles([file]);
              return;
            }
          }
        }
      }

      // Otherwise insert text
      const text = e.clipboardData?.getData("text/plain");
      document.execCommand("insertText", false, text);
    };

    if (editor) {
      editor.addEventListener("paste", handlePaste);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("paste", handlePaste);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      fixListAlignment(editorRef.current);
    }
  }, [value]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFiles(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await axiosInstance.post(
          "/uploadBlogImage",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const imagePath = uploadResponse.data.imagePath;

        insertImageAtCursor(imagePath);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const insertImageAtCursor = (imagePath: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      const img = document.createElement("img");
      img.src = imagePath;
      img.alt = "Uploaded image";
      img.dataset.path = imagePath;

      range.deleteContents();
      range.insertNode(img);

      range.setStartAfter(img);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      handleInput();
    }
  };

  // Remove selected image
  const removeSelectedImage = async () => {
    if (!selectedImage) return;

    try {
      const imagePath = selectedImage.getAttribute("data-path");

      if (imagePath) {
        await axiosInstance.post("/removeBlogImage", { imagePath });
      }

      selectedImage.parentNode?.removeChild(selectedImage);
      setSelectedImage(null);

      handleInput();
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image. Please try again.");
    }
  };

  const handleRemoveImage = () => {
    removeSelectedImage();
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar-header">
        <select
          value={selectedHeading}
          onChange={handleHeadingChange}
          className="dropdown-editor"
        >
          <option value="Normal">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <button type="button" onClick={() => handleFormat("bold")}>
          <FaBold />
        </button>
        <button type="button" onClick={() => handleFormat("italic")}>
          <FaItalic />
        </button>
        <button type="button" onClick={() => handleFormat("underline")}>
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => handleFormat("insertUnorderedList")}
        >
          <FaListUl />
        </button>
        <button type="button" onClick={() => handleFormat("insertOrderedList")}>
          <FaListOl />
        </button>
        <button type="button" onClick={() => handleFormat("justifyLeft")}>
          <FaAlignLeft />
        </button>
        <button type="button" onClick={() => handleFormat("justifyCenter")}>
          <FaAlignCenter />
        </button>
        <button type="button" onClick={() => handleFormat("justifyRight")}>
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          A
        </button>
        <button type="button" onClick={() => handleFormat("undo")}>
          <FaUndo />
        </button>
        <button type="button" onClick={() => setShowLinkInput(!showLinkInput)}>
          <FaLink />
        </button>
        <button
          type="button"
          onClick={exitList}
          title="Exit list and reset alignment"
        >
          Exit List
        </button>
        <button
          type="button"
          onClick={handleImageButtonClick}
          title="Insert Image"
        >
          <FaImage />
        </button>

        {selectedImage && (
          <button
            type="button"
            onClick={handleRemoveImage}
            title="Remove Image"
          >
            <FaTrash />
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          multiple
          style={{ display: "none" }}
        />
      </div>

      {showColorPicker && (
        <div className="color-picker-container">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorChange(color)}
              className="color-button"
              style={{
                backgroundColor: color,
                border: color === selectedColor ? "2px solid #000" : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* Link Input */}
      {showLinkInput && (
        <div className="link-input-container">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Enter link URL"
          />
          <button type="button" onClick={handleAddLink}>
            Add
          </button>
          <button type="button" onClick={handleCancelLink}>
            <FaTimes />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        className="editor-body"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
      />

      {uploading && (
        <div className="image-upload-overlay">
          <div className="image-upload-progress">
            <p>Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTextEditor;
