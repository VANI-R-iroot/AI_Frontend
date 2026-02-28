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
} from "react-icons/fa";

interface CustomTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const CustomTextEditor: React.FC<CustomTextEditorProps> = ({
  value,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState("Normal");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");

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

  // Inject CSS to fix the list alignment issues
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .user-dashboard-editor-body ul, .user-dashboard-editor-body ol {
        display: block;
        padding-left: 20px;
        margin-left: 0;
      }
      
      /* Override default list display */
      .user-dashboard-editor-body ul li, .user-dashboard-editor-body ol li {
        display: list-item;
        text-align: inherit;
      }
      
      /* Alignment styles */
      .user-dashboard-editor-body div[style*="text-align: center"], 
      .user-dashboard-editor-body p[style*="text-align: center"] {
        text-align: center !important;
      }
      
      .user-dashboard-editor-body div[style*="text-align: right"],
      .user-dashboard-editor-body p[style*="text-align: right"] {
        text-align: right !important;
      }
      
      /* Container alignments for lists */
      .user-dashboard-editor-body div[style*="text-align: center"] ul,
      .user-dashboard-editor-body div[style*="text-align: center"] ol,
      .user-dashboard-editor-body p[style*="text-align: center"] ul,
      .user-dashboard-editor-body p[style*="text-align: center"] ol {
        display: inline-block;
        text-align: left;
        margin: 0 auto;
      }
      
      .user-dashboard-editor-body div[style*="text-align: right"] ul,
      .user-dashboard-editor-body div[style*="text-align: right"] ol,
      .user-dashboard-editor-body p[style*="text-align: right"] ul,
      .user-dashboard-editor-body p[style*="text-align: right"] ol {
        display: inline-block;
        text-align: left;
        margin-left: auto;
      }
      
      /* Base list spacing */
      .user-dashboard-editor-body ol, .user-dashbord-editor-body ul {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      /* Break list styling */
      .user-dashboard-editor-body .list-break {
        display: block;
        margin-top: 10px;
        margin-bottom: 10px;
        text-align: left;
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
      // Handle Shift+Enter to break out of a list
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();

        // Insert a break and move cursor to left-aligned position
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          // Check if we're in a list
          const range = selection.getRangeAt(0);
          let listItem = range.commonAncestorContainer;

          // Find if we're in a list item
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
    };

    if (editor) {
      editor.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, []);

  const handleFormat = (command: string, value?: string) => {
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let listItem = range.commonAncestorContainer;

        while (listItem && listItem.nodeName !== "LI" && listItem.parentNode) {
          listItem = listItem.parentNode as Node;
        }

        if (listItem && listItem.nodeName === "LI") {
          const parentList = listItem.parentNode;
          const isOrdered = parentList?.nodeName === "OL";

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

        const parentElement = range.commonAncestorContainer.parentElement;
        let currentAlign = "left";

        if (parentElement) {
          const style = window.getComputedStyle(parentElement);
          currentAlign = style.textAlign;
        }

        // Execute the list command
        document.execCommand(command, false, value);

        if (currentAlign !== "left") {
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

  const exitList = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let listItem = range.commonAncestorContainer;
    while (listItem && listItem.nodeName !== "LI" && listItem.parentNode) {
      listItem = listItem.parentNode as Node;
    }

    if (listItem && listItem.nodeName === "LI") {
      const breakDiv = document.createElement("div");
      breakDiv.className = "list-break";
      breakDiv.innerHTML = "<br>";

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
      // Fix for existing lists
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

  return (
    <div className="userDashboard-editor-container">
      {/* Toolbar */}
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
      </div>

      {/* Color Picker */}
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

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="user-dashboard-editor-body"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  );
};

export default CustomTextEditor;
