import React from 'react'
import {HOME, JWT_KEY, WRAPPED} from "../components/consts";
import Head from 'next/head'
export default class RedirectPage extends React.Component {
    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const auth_code = urlParams.get("code")
        if (auth_code) {

            fetch("http://localhost:5000/auth/" + auth_code).then(response => response.json()).then(data => {
                var jwt_token = data["jwt"]
                localStorage.setItem(JWT_KEY, jwt_token)
                window.location.href = WRAPPED

            }).catch(() => {
                window.location.href = HOME
            })

        } else if (localStorage.getItem(JWT_KEY) !== null) {
            window.location.href = WRAPPED
        } else {
            window.location.href = HOME
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