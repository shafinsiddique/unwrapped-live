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
    WRAPPED, PERSONALIZATION, TRACKS, ALBUM, IMAGES, ARTISTS, NAME
} from '../components/consts'
import styles from '../styles/Wrapped.module.css'
import Navbar from "../components/Navbar";
import Head from 'next/head'
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

    render() {
        this.getTrackListings()
        const tracksRowStyle =  styles.tracksRow +  " " + styles.topTracksPadding
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
                        Your Top Artists
                    </span>
                    <div className={tracksRowStyle}>
                        {this.getArtistListings()}
                    </div>
                    <span className={styles.summaryTableHeader + " " + styles.secondHeaderPadding}>
                        Your Top Tracks
                    </span>
                    <div className={tracksRowStyle}>
                        {this.getTrackListings()}
                    </div>

                </div>
            </div>
        </div>
        </body>
        </html>
    }
}