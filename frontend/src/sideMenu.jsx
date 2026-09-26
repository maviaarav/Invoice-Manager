import "./menu.css";
import { NavLink } from "react-router-dom";
import instance from "./api/axios";
import { useState, useEffect } from "react";

import {
    AppsRegular,
    ReceiptRegular,
    SettingsRegular,
    PersonRegular
} from "@fluentui/react-icons";

function SideMenu() {
    const [userProfile, setUserProfile] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const fetchProfile = async () => {
        try{
            const response = await instance.get('/user/getUserProfile');
            const data = response.data;
            setUserProfile(data);
            const profilePicture = data.profilePicture.replace(/=s\d+(-c)?$/, '=s400');
            setProfileImage(profilePicture);

        }catch(err){
            console.log(err);
        }
    }
    useEffect(() => {
        fetchProfile();
    }, []);
    return (
        <aside className="side-menu">

            <div className="text">
                <h3 id="menuText">Invoice</h3>
                <p>PREMIUM FINANCIALS</p>
            </div>

            <div className="links">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? "link-menu active" : "link-menu"
                    }
                >
                    <div className="active-bar"></div>
                    <AppsRegular />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/invoices"
                    className={({ isActive }) =>
                        isActive ? "link-menu active" : "link-menu"
                    }
                >
                    <div className="active-bar"></div>
                    <ReceiptRegular />
                    <span>Invoices</span>
                </NavLink>
                <NavLink
                    to="/proforma-invoices"
                    className={({ isActive }) =>
                        isActive ? "link-menu active" : "link-menu"
                    }
                >
                    <div className="active-bar"></div>
                    <ReceiptRegular />
                    <span>Proforma Invoices</span>
                </NavLink>

                <NavLink
                    to="/clients"
                    className={({ isActive }) =>
                        isActive ? "link-menu active" : "link-menu"
                    }
                >
                    <div className="active-bar"></div>
                    <PersonRegular />
                    <span>Clients</span>
                </NavLink>

            </div>

            <div className="systems">
                {userProfile.success && (
                <div className="profilePhoto">
                   <div className="iconPhoto">
                    {userProfile && (
    <img
        src={profileImage}
        alt="Profile"
        referrerPolicy="no-referrer"
    />
)}
                   </div>
            
                   <div className="profileName">
                        {userProfile && (
                            <>
                            <span className="profileNameText">{userProfile.name}</span>
                            <span className="profileEmail">{userProfile.email}</span>
                            </>
                        )}
                   </div>
                </div>
                )}
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "link-menu active" : "link-menu"
                    }
                >
                    <div className="active-bar"></div>
                    <SettingsRegular />
                    <span>Settings</span>
                </NavLink>

            </div>

        </aside>
    );
}

export default SideMenu;