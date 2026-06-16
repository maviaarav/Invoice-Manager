import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./client_form.css";
import { CheckmarkStarburst32Regular } from "@fluentui/react-icons";
const ClientForm = () =>{
    return (
       <div className="formContainer">
            <div className="form"></div>
            <div className="promotion">
                <div className="invoizor">
                    <div className="heading-ino">
                        <h3 id="text">Why Invoizor?</h3>
                        <div className="icon">
 <CheckmarkStarburst32Regular />
                        </div>
                       
                    </div>
                    <p id="textPara">Adding complete client profiles
ensures automated tax compliance,
accurate invoice aging reports, and
seamless payment collection cycles.</p>
                </div>
            </div>
       </div>
    )
}
export default ClientForm;