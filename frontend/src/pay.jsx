import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Pay = () => {
    const [params] = useSearchParams();
    const [upiLink, setUpiLink] = useState("");

    useEffect(() => {
        const upi = params.get("upi");

        if (upi) {
            const decoded = decodeURIComponent(upi);
            setUpiLink(decoded);

            setTimeout(() => {
                window.location.href = decoded;
            }, 1000);
        }
    }, []);

    return (
        <>
            <style>{`
                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                    font-family:Inter,Segoe UI,sans-serif;
                }

                body{
                    background:#f5f7fb;
                }

                .payment-page{
                    height:100vh;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    padding:20px;
                }

                .payment-card{
                    width:100%;
                    max-width:430px;
                    background:white;
                    border-radius:20px;
                    padding:40px 35px;
                    box-shadow:0 15px 40px rgba(0,0,0,.08);
                    text-align:center;
                }

                .success-icon{
                    width:85px;
                    height:85px;
                    background:#e9f9ef;
                    border-radius:50%;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    margin:auto;
                    font-size:40px;
                }

                h2{
                    margin-top:25px;
                    color:#1f2937;
                    font-size:28px;
                }

                p{
                    margin-top:15px;
                    color:#6b7280;
                    line-height:1.7;
                    font-size:15px;
                }

                .loader{
                    width:55px;
                    height:55px;
                    border:5px solid #d1fae5;
                    border-top:5px solid #16a34a;
                    border-radius:50%;
                    margin:35px auto;
                    animation:spin 1s linear infinite;
                }

                @keyframes spin{
                    to{
                        transform:rotate(360deg);
                    }
                }

                .btn{
                    display:inline-block;
                    margin-top:10px;
                    background:#16a34a;
                    color:white;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:10px;
                    font-weight:600;
                    transition:.3s;
                }

                .btn:hover{
                    background:#15803d;
                }

                .note{
                    margin-top:25px;
                    font-size:13px;
                    color:#9ca3af;
                }

                @media(max-width:500px){
                    .payment-card{
                        padding:30px 25px;
                    }

                    h2{
                        font-size:24px;
                    }
                }
            `}</style>

            <div className="payment-page">
                <div className="payment-card">

                    <div className="success-icon">
                        💳
                    </div>

                    <h2>Opening Payment App</h2>

                    <p>
                        Please wait while we securely redirect you to your
                        preferred UPI application.
                    </p>

                    <div className="loader"></div>

                    <a className="btn" href={upiLink}>
                        Open Payment App
                    </a>

                    <div className="note">
                        If nothing happens, your browser may not support opening
                        UPI apps directly.<br />
                        Please use the QR code provided in your invoice.
                    </div>

                </div>
            </div>
        </>
    );
};

export default Pay;