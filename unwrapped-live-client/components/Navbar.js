import React from "react";
import Image from "next/image";

export default class Navbar extends React.Component {
    render() {
        return <div className="navbar">
            <div className="navbar-container">
                <div className="logo-container">
                    <Image src="/headphones.png" width={32} height={32}/>
                    <span className="logo-text">unwrapped.live</span>
                </div>
                {this.props.children}
            </div>
        </div>
    }
}