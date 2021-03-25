import React from 'react'
const HOME = "http://localhost:3000"
export default class RedirectPage extends React.Component {
    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const auth_code = urlParams.get("code")
        var validated = false
        if (auth_code) {
            //  send auth_code to server for validation.
            fetch("http://localhost:5000/auth/" + auth_code).then(response => response.json()).then(data => {
                alert(JSON.stringify(data))
            })

            validated = true

        }

        if (!validated){
            window.location.href = HOME
        }
    }

    render(){
        return <div></div>
    }
}