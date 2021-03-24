import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
export default function Home() {
  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-container">
            <div className="logo-container">
                <Image src="/headphones.png" width={32} height={32}/>
                    <span className="logo-text">unwrapped.live</span>
            </div>

        </div>
      </div>
    </div>
  )
}
