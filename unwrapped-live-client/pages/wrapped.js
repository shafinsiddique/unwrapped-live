import React from 'react'
import {HOME, JWT_KEY, API_GET_DATA, POST, JWT, CONTENT_TYPE, APPLICATION_JSON} from '../components/consts'

export default class WrappedPage extends React.Component {
    componentDidMount() {
        let jwt_token = localStorage.getItem(JWT_KEY)
        if (jwt_token !== null) {
            var headers = new Headers()
            headers.set("Authorization",jwt_token)
            var request = new Request(API_GET_DATA, {method: "GET", headers:new Headers(),mode: "cors",
            cache: "default"})
            fetch(request).then(response => response.json()).then(data => {
                console.log(data)
            }).catch(() => {
                console.log("hello")
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