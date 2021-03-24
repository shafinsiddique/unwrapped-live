import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import Navbar from "../components/Navbar";
export default function HomePage() {
  return (
    <div className="container">
      <Navbar/>
      <div>
          <div className={styles.mainContentContainer + " " + styles.mainContentContainerPadding}>
              <div className={styles.mainTextContainer}>
                    <span className={styles.mainDescriptionText}>
                        Get Your Spotify Wrapped.
                    </span>
                  <span className={styles.subDescriptionText}>You don't have to wait till the end of the year.</span>
                  <div className={styles.btnPadding}>
                      <button className={styles.connectSpotifyBtn}>Connect Spotify</button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}
