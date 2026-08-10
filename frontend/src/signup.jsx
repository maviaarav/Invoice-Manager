import { useState} from 'react'
import { useNavigate } from 'react-router-dom';
import instance from './api/axios'
import './signUp.css'
import { WalletCreditCard48Regular,MailAllUnreadRegular,Password32Regular,Eye32Regular,EyeOff32Regular,Person32Regular } from '@fluentui/react-icons';
import { Routes, Route }
from "react-router-dom";
import googleImage from './images/google.png'
const SignUp =  (e) =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp =  async (e) =>{
        e.preventDefault();
        try{

            const response = await instance.post(
                '/user/signup',
                {
                    name,
                    email,
                    password
                }
            )
            console.log("response.data", response.data);
            console.log("response.Msg", response.Msg);
            
            if(response.data.success === true){
               window.location.href = '/';
            }
            

        }catch(err){
            console.log(err.response?.data?.Msg);
            setError(err.response?.data?.Msg)
        }

    }
    const togglePasswordVisibility = () => {
        const passwordInput = document.getElementById('showPas');
        
        setShowPassword(!showPassword);
        passwordInput.style.transition = 'opacity 0.3s ease';
        passwordInput.style.opacity = '0';
        passw
        
        setTimeout(() => {
          passwordInput.style.opacity = '1';
        }, 300);
        if (!showPassword) {
            passwordInput.style.color = '#2563EB';
        } else {
            passwordInput.style.color = '#66667A';
        }

    };
    const isValidform = email.trim() !== "" && password.trim() !== ""; 


const navigate = useNavigate();
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
                    <h1>Start Billing Like a <span id="gst-compliant">Professional</span></h1>

                </div>
                <p>Create GST-compliant invoices, track payments, and grow your <br /> business with India's most advanched Financial Toolkit.</p>
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
                    <div className="items">
                        <span className="checkIcon">
                            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                                <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="itemText">Invoice Tracking</span>
                    </div>
                </div>
                <div className="animatedImage-2"></div>
            </div>
            <div className="loginForm">
                <div className="login">
                    <h2>Create Your Account</h2>
                    <p>Get started in less than a minute.</p>
                    <div className="inputFields">
                        <form onSubmit={handleSignUp}>
                            <label >Email Address</label>
                            <div className="inputbox">
                                <MailAllUnreadRegular className='inputIcon'/>
                                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder= 'name@company.com' required/>
                            </div>

                            <label >Name</label>
                            <div className="inputbox">
                                <Person32Regular className='inputIcon'/>
                                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder='Enter your name' required/>
                            </div>

                            <label >Password</label>
                            <div className="inputbox">
                                <Password32Regular className='inputIcon'
                                />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='••••••••' required/>
                              
                                    {showPassword ? <EyeOff32Regular  id='showPas' onClick={togglePasswordVisibility} /> : <Eye32Regular className='eyeIcon' id='showPas' onClick={togglePasswordVisibility} />
                                    }
                            </div>
                            
                            <button type="submit" id="loginButton" disabled={!isValidform} 
                            style={{
                                backgroundColor: isValidform ? '#2563EB' : '#A0AEC0',
                                cursor: isValidform ? 'pointer' : 'not-allowed'
                            }}
                            >
                                Create Account 
                            </button>
                        </form>
                        

                    </div>
                   <div className="signUpLink">
                        <span>Already have an account?</span>
                        <span className="link" onClick={()=>navigate('/login')}>Sign In</span>
                    </div>
                    <div className="or">
                             <span>or</span>
                                        </div>
                                        <div className="google">
                                            <button type="button" id="googleButton" onClick={()=>window.location.href = 'https://api.invoizor.me/api/google/connect'}>
                                                <img src={googleImage} alt="Google Logo" />
                                                <span>Continue with Google</span>
                                            </button>
                                        </div>
                    <div className="errorMessage">
                        {error && <p>{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    </>

}
export default SignUp