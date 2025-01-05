"use client";
import React, { useContext } from "react";
import styles from "./styles.module.css";

const Loading = () => {
  return (
    <div className={`${styles.wrapper}`}>
      <div className={styles.board} style={{ fontSize: "100px" }}>
        <div className={`${styles.firstCol}`}>
          <span className={`${styles.title}`} />
          <div className={styles.column}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        </div>
        <div className={`${styles.secondCol}`}>
          <span className={`${styles.title}`} />
          <div className={styles.column}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        </div>
        <div className={`${styles.thirdCol}`}>
          <span className={`${styles.title}`} />
          <div className={styles.column}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
