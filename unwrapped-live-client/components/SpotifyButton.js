import styles from '../styles/SpotifyButton.module.css'
import React from "react";
export default class SpotifyButton extends React.Component {
    render() {
        return (
            <button className={styles.connectSpotifyBtn}>{this.props.children}</button>
        );
    }
}