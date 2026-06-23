import styles from './UiTools.module.scss';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`${styles.skeletonBlock} ${className}`} />;
}

function SkeletonTableSection({ rows }: { rows: number }) {
  if (rows <= 0) return null;
  return (
    <div className={styles.skeletonSection}>
      <SkeletonBlock className={styles.skeletonSectionTitle} />
      <SkeletonBlock className={styles.skeletonTableHeader} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className={styles.skeletonTableRow} />
      ))}
    </div>
  );
}

export default function ReportSkeleton() {
  return (
    <div className={styles.reportSkeleton}>
      <div>
        <div style={{ height: '1px', background: '#a1a1a1' }} />
        <div className={styles.skeletonHeader}>
          <SkeletonBlock className={styles.skeletonHeaderTitle} />
          <div className={styles.skeletonHeaderButtons}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className={styles.skeletonHeaderButton} />
            ))}
          </div>
        </div>
        <div style={{ height: '1px', background: '#a1a1a1' }} />
      </div>

      <div className={styles.skeletonContentsLayout}>
        <div className={styles.skeletonInner}>
          {/* 1. 테스트 요약 */}
          <SkeletonTableSection rows={8} />

          {/* 2. 주요 결함 내역 */}
          <SkeletonTableSection rows={5} />

          {/* 3. 주요 개선 내역 */}
          <SkeletonTableSection rows={5} />

          {/* 4. 재발생 이슈 (QC) */}
          <SkeletonTableSection rows={3} />

          {/* 5. 재발생 이슈 (확인이슈) */}
          <SkeletonTableSection rows={3} />

          {/* 6. 집계 제외 이슈 */}
          <SkeletonTableSection rows={3} />

          {/* 7. 차트 */}
          <div className={styles.skeletonSection}>
            <SkeletonBlock className={styles.skeletonSectionTitle} />
            <SkeletonBlock className={styles.skeletonChartBlock} />
            <SkeletonBlock className={styles.skeletonChartBlock} />
          </div>
        </div>
      </div>
    </div>
  );
}
