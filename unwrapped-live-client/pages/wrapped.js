import React from 'react'
import {
    ALBUM,
    API_GET_DATA,
    API_REFRESH,
    ARTISTS,
    DISPLAY_NAME,
    IMAGES,
    JWT_KEY,
    NAME,
    PERSONALIZATION,
    POST,
    PROFILE,
    TRACKS,
    WRAPPED
} from '../components/consts'
import styles from '../styles/Wrapped.module.css'
import Navbar from "../components/Navbar";
import Head from 'next/head'
import SpotifyButton from "../components/SpotifyButton";

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
        var listings = []
        if (this.state.data[PERSONALIZATION]) {
            var tracks = this.state.data[PERSONALIZATION][TRACKS]
            tracks.forEach((track, i) => {
                var listing_style = i == 0 ? styles.listing : styles.listing + " " + styles.listingPadding
                var listing = <div className={listing_style} key={"track-"+i}>
                    <div className={styles.imgBox + " " + styles.imgButton}>
                        <img src={track[ALBUM][IMAGES][1]["url"]} className={styles.trackImg}/>
                    </div>
                    <span className={styles.songName} style={{"paddingTop":"10px"}}>
                        {track[NAME]}

                    </span>
                    <span className={styles.artistName} style={{"paddingTop":"5px"}}>
                      {track[ARTISTS][0][NAME]}
                    </span>
                </div>
                listings.push(listing)
            })

            return listings
        }
    }

    getArtistListings() {
        var listings = []
        if (this.state.data[PERSONALIZATION]) {
            var artists = this.state.data[PERSONALIZATION][ARTISTS]
            artists.forEach((artist, i) => {
                console.log(artist)
                var listing_style = i == 0 ? styles.listing : styles.listing + " " + styles.listingPadding
                var listing = <div className={listing_style} key={"track-"+i}>
                    <div className={styles.imgBox + " " + styles.imgButton}>
                        <img src={artist[IMAGES][1]["url"]} className={styles.trackImg}/>
                    </div>
                    <span className={styles.songName} style={{"paddingTop":"10px"}}>
                        {artist[NAME]}
                    </span>
                </div>
                listings.push(listing)
            })

            return listings
        }

    }

    getName() {
        const defaultName = "Your"
        if (this.state.data[PERSONALIZATION]) {
            var name = this.state.data[PROFILE][DISPLAY_NAME]
            return name == null || name == "null" ? defaultName : name + "'s"
        }

        return defaultName

    }

    render() {
        this.getTrackListings()
        const tracksRowStyle =  styles.tracksRow +  " " + styles.topTracksPadding
        var name = this.getName()
        return <html>
        <Head>
            <title>My Wrapped</title>
        </Head>
        <body style={{"backgroundColor":"black"}}>
        <div className={styles.wrappedContainer}>
            <Navbar/>
            <div>
                <div className={styles.summaryContainer}>
                    <span className={styles.summaryTableHeader}>
                        {name + " Top Tracks"}

                        {/*Your Top Tracks*/}
                    </span>
                    <div className={tracksRowStyle}>
                        {this.getTrackListings()}
                    </div>

                    <span className={styles.summaryTableHeader  + " " + styles.secondHeaderPadding}>
                        {name + " Top Artists"}
                        {/*Your Top Artists*/}
                    </span>
                    <div className={tracksRowStyle}>
                        {this.getArtistListings()}
                    </div>
                    <div style={{"paddingTop":"50px"}}>
                        <SpotifyButton>
                            Log Out
                        </SpotifyButton>
                    </div>


                </div>
            </div>
        </div>
        </body>
        </html>
    }
}