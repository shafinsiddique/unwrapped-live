import React from 'react'
import {API_AUTH, HOME, JWT_KEY, redirectToHome, WRAPPED} from "../components/consts";
import Head from 'next/head'
export default class RedirectPage extends React.Component {
    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const auth_code = urlParams.get("code")
        if (auth_code) {
            fetch(API_AUTH + "/" + auth_code).then(response => response.json()).then(data => {
                var jwt_token = data["jwt"]
                localStorage.setItem(JWT_KEY, jwt_token)
                window.location.href = WRAPPED

            }).catch(() => {
                redirectToHome()
            })

        } else if (localStorage.getItem(JWT_KEY) !== null) {
            window.location.href = WRAPPED
        } else {
            redirectToHome()
        }

    }

    render(){
        return <html>
        <Head>
            <title>Redirecting</title>
        </Head>
        </html>
    }
}