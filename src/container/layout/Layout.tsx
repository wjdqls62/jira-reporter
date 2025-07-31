import { Outlet } from 'react-router-dom';

import styles from './Layout.module.scss';

export default function Layout() {
  return (
    <div className={styles.layoutContainer}>
      {/*<div className={styles.sideBar}>
        <aside>
          <div className={styles.logo}>
            <h2>QA Tools</h2>
          </div>
          <nav>
            <ul>
              <li>
                <Link to="/">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/report">
                  Report
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>*/}
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
}