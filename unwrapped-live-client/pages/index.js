import styles from '../styles/Home.module.css'
import Navbar from "../components/Navbar";
import SpotifyButton from '../components/SpotifyButton'
import React from 'react'
const CLIENT_ID = "0fcccb78740a42dab96c20f4ebb9dbae"
const REDIRECT_URI = "http://localhost:3000/redirect"

export default class HomePage extends React.Component {
    constructor(props) {
        super(props)
        this.onConnectButtonClick = this.onConnectButtonClick.bind(this)
    }

    onConnectButtonClick(e){
        window.location.href =
            `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user-top-read`
    }

    render() {
        return <div className="container">
            <Navbar/>
            <div>
                <div className={styles.mainContentContainer + " " + styles.mainContentContainerPadding}>
                    <div className={styles.mainTextContainer}>
                    <span className={styles.mainDescriptionText}>
                        Get Your Spotify Wrapped.
                    </span>
                        <span className={styles.subDescriptionText}>You don't have to wait till the end of the year.</span>
                        <div className={styles.btnPadding}>
                            <SpotifyButton onClick={this.onConnectButtonClick}>Connect Spotify</SpotifyButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

}
