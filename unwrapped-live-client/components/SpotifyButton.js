import styles from '../styles/SpotifyButton.module.css'
import React from "react";
export default class SpotifyButton extends React.Component {
    render() {
        var onClick = this.props.onClick ? this.props.onClick : (e) => {}
        return (
            <button className={styles.connectSpotifyBtn} onClick={onClick}>{this.props.children}</button>
        );
    }
}