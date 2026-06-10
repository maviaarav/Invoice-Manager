import { useState} from 'react'
import instance from './api/axios'
import './App.css'
import { WalletCreditCard48Regular } from '@fluentui/react-icons';
import { Routes, Route }
from "react-router-dom";

const Login =  (e) =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handlerLogin =  async () =>{
        try{

            const response = await instance.post(
                '/user/login',
                {
                    email,
                    password
                }
            )
            console.log(response.data)

        }catch(err){
            console.log("Error", err)
        }
    }


    return <>
        <div className="loginPage">
            <div className="textAnimated">
                <div className="logo">
                    <div className="icon">
                        <WalletCreditCard48Regular/>
                    </div>
                    <div className="LogoText">
                        Invoizor
                    </div>
                </div>
                <div className="Heading">
                    <h1>Generate <span id="gst-compliant">GST-Compliant</span> Invoices in Seconds</h1>

                </div>
                <p>Manage clients, invoices, taxes, payments, and reports from one powerful
                    platform. <br />Built for Indian businesses who value precision and speed.</p>
                <div className="supports">
                    <div className="items">
                        <span className="checkIcon">
                            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                                <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="itemText">GST Ready</span>
                    </div>
                    <div className="items">
                        <span className="checkIcon">
                            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                                <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="itemText">CGST / SGST / IGST Support</span>
                    </div>
                    <div className="items">
                        <span className="checkIcon">
                            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                                <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="itemText">PDF Export</span>
                    </div>
                </div>
            </div>
        </div>
    </>

}
export default Login