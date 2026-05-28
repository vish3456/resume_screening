import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableChartIcon from "@mui/icons-material/TableChart";
import styles from "./ScreeningToolbar.module.css";

const ScreeningToolbar = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  onExportCSV,
  onExportExcel,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} sx={{ fontSize: 20 }} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <select
        className={styles.sortSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="rank">By Rank</option>
        <option value="score">By Score</option>
        <option value="name">By Name</option>
      </select>

      <button className={styles.exportBtn} onClick={onExportCSV}>
        <FileDownloadIcon sx={{ fontSize: 18 }} />
        CSV
      </button>

      <button className={styles.exportBtn} onClick={onExportExcel}>
        <TableChartIcon sx={{ fontSize: 18 }} />
        Excel
      </button>
    </div>
  );
};

export default ScreeningToolbar;

