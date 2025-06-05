import Editor from "@monaco-editor/react";
import React from "react";

function MonacoEditor() {
    const handleEditorChange = (value) => {
        console.log("Current code:", value);
      };
    
      return (
        <div style={{ height: "500px" }}>
         
        </div>
      );
}

export default MonacoEditor;
