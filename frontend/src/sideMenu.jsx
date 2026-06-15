import "./menu.css";
import { NavLink } from "react-router-dom";
import {
    AppsRegular,
    ReceiptRegular,
    SettingsRegular,
    PersonRegular
} from "@fluentui/react-icons";

function SideMenu() {
    return (
        <div className="side-menu">

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

        </div>
    );
}

export default SideMenu;