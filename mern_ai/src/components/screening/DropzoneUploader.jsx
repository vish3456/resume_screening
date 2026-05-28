import React from "react";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import styles from "./DropzoneUploader.module.css";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtBadge = (name) => {
  const ext = name.split(".").pop().toUpperCase();
  return ext;
};

const DropzoneUploader = ({
  files,
  setFiles,
  accept = {},
  maxFiles = 10,
  label = "Drag & drop files here, or click to browse",
  sublabel = "",
  multiple = true,
}) => {
  const onDrop = (acceptedFiles) => {
    if (multiple) {
      const combined = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(combined);
    } else {
      setFiles(acceptedFiles.slice(0, 1));
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
  });

  return (
    <div className={styles.dropzoneWrapper}>
      <div
        {...getRootProps()}
        className={[
          styles.dropzone,
          isDragActive ? styles.dropzoneActive : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon
          className={styles.dropzoneIcon}
          sx={{ fontSize: 44 }}
        />
        <div className={styles.dropzoneLabel}>
          {isDragActive ? "Drop files here..." : label}
        </div>
        {sublabel && <div className={styles.dropzoneSublabel}>{sublabel}</div>}
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={styles.fileItem}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className={styles.fileBadge}>{getExtBadge(file.name)}</span>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
              <button
                type="button"
                className={styles.fileRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropzoneUploader;

