import React from 'react'
import {
    HOME,
    JWT_KEY,
    API_GET_DATA,
    POST,
    JWT,
    CONTENT_TYPE,
    APPLICATION_JSON,
    API_REFRESH,
    WRAPPED
} from '../components/consts'
import styles from '../styles/Wrapped.module.css'
import Navbar from "../components/Navbar";

export default class Wrapped extends React.Component {
    constructor(props) {
        super(props)
        this.state = {data:{}}
    }

    componentDidMount() {
        let jwt_token = localStorage.getItem(JWT_KEY)
        if (jwt_token !== null) {
            fetch(API_GET_DATA, {body:JSON.stringify({"jwt":jwt_token}),method:"POST",
            headers:{"Content-Type":"application/json"}}).then(response => response.json()).then(data => {
                var state = {data:data}
                this.setState(state)
                console.log(data)

            }).catch(() => {
                fetch(API_REFRESH, {body: JSON.stringify({"jwt":jwt_token}), method:"POST",
                headers:{"Content-Type":"application/json"}}).then(response => response.json()).then(data => {
                    jwt_token = data["jwt"]
                    localStorage.setItem(JWT_KEY, jwt_token)
                    window.location.href = WRAPPED
                    fetch(API_GET_DATA, {body:JSON.stringify({"jwt":jwt_token}),method:"POST",
                        headers:{"Content-Type":"application/json"}}).then(response => response.json()).then(data => {
                        var state = {data:data}
                        this.setState(state)

                    }).catch(() => {

                    })
                })
            })


        } else {

        }

        // if (!validated) {
        //     window.location.href = HOME
        // }
    }

    getTrackListings() {

    }

    render() {
        return <div className={styles.wrappedContainer}>
            <Navbar/>
            <div>
                <div className={styles.summaryContainer}>
                    <span className={styles.summaryTableHeader}>
                        Your Top Tracks
                    </span>
                    <div className={styles.tracksRow + " " + styles.topTracksPadding}>
                        <div className={styles.listing}>
                            <div className={styles.imgBox + " " + styles.imgButton}>

                            </div>
                            <span className={styles.songName}>

                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}