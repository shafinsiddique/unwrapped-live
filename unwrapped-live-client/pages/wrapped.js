import React from 'react'
import {HOME, JWT_KEY, API_GET_DATA, POST, JWT, CONTENT_TYPE, APPLICATION_JSON} from '../components/consts'

export default class WrappedPage extends React.Component {
    componentDidMount() {
        let jwt_token = localStorage.getItem(JWT_KEY)
        if (jwt_token !== null) {
            console.log(jwt_token)
            fetch(API_GET_DATA, {body:JSON.stringify({"jwt":jwt_token}),method:"POST",
            headers:{"Content-Type":"application/json"}}).then(response => response.json()).then(data => {
                console.log(data)
            }).catch(() => {
            })

            // var request = new Request(API_GET_DATA, {method:"GET",headers: {
            //     "Content-Type":APPLICATION_JSON,
            //         "Authorization":jwt_token,
            //         "Accept":"*/*",
            //         "Sec-Fetch-Mode":"cors"
            //     }})
            // fetch(request).
            // then(response => response.json()).
            // then(data => {
            //     console.log(JSON.stringify(data))
            // }).catch(() => {
            //
            // })

        } else {
        }

        // if (!validated) {
        //     window.location.href = HOME
        // }
    }

    render() {
        return <div>

        </div>
    }
}