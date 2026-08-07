import { Link } from "react-router-dom";
import "./landingHome.css";

const features = [
    { icon: "📄", title: "Create GST invoices", text: "Generate professional invoices with GST-ready fields in a few steps." },
    { icon: "👥", title: "Manage customers", text: "Keep all client details organized in one secure dashboard." },
    { icon: "🏢", title: "Manage company details", text: "Store business information once and reuse it across invoices." },
    { icon: "📧", title: "Send invoices through Gmail", text: "Connect Gmail when needed and send invoices directly from your account." },
    { icon: "📥", title: "Download invoices as PDF", text: "Export polished invoice PDFs ready to share or archive." },
    { icon: "📊", title: "Track invoice history", text: "Review invoice status, history, and customer activity from one place." },
];

const steps = [
    "Create an account.",
    "Add your company and customers.",
    "Generate an invoice.",
    "Connect Gmail (optional).",
    "Send invoices directly from your Gmail account.",
];

const privacyPoints = [
    "Your data remains private.",
    "Google data is used only for requested functionality.",
    "We never sell or share user information.",
    "OAuth authentication is used for secure access.",
];

const screenshots = [
    {
        title: "Dashboard",
        text: "Overview of invoices, customers, and business activity.",
    },
    {
        title: "Invoice creation page",
        text: "Fast invoice builder with customer and GST details.",
    },
    {
        title: "Invoice preview",
        text: "Clean preview before you download or send the invoice.",
    },
    {
        title: "Customer management",
        text: "All client records organized in one place.",
    },
];

function LandingHome() {
    return (
        <div className="landing-page">
            <header className="landing-nav">
                <div className="brand-block">
                    <div className="brand-mark">I</div>
                    <div>
                        <p className="brand-kicker">Invoice Manager</p>
                        <h1 className="brand-name">Invoizor</h1>
                    </div>
                </div>

                <nav className="nav-links" aria-label="Primary">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="nav-actions">
                    <Link className="ghost-button" to="/login">Sign In</Link>
                </div>
            </header>

            <main>
                <section className="hero-section" id="home">
                    <div className="hero-copy">
                        <p className="eyebrow">Secure invoice management</p>
                        <h2>Invoizor</h2>
                        <p className="hero-text">
                            Create, manage, and send professional GST invoices securely from one place.
                        </p>
                        <div className="hero-actions">
                            <Link className="primary-button" to="/signUp">Get Started</Link>
                            <Link className="secondary-button" to="/login">Sign In</Link>
                        </div>
                    </div>

                    <div className="hero-panel">
                        <div className="panel-top">
                            <span>Invoice status</span>
                            <strong>GST ready</strong>
                        </div>
                        <div className="panel-card">
                            <div>
                                <p>Invoices sent this month</p>
                                <strong>128</strong>
                            </div>
                            <div>
                                <p>Customers managed</p>
                                <strong>42</strong>
                            </div>
                        </div>
                        <div className="panel-card muted">
                            <p>Gmail connection is optional and only used when you choose to send invoices from your account.</p>
                        </div>
                    </div>
                </section>

                <section className="content-section" id="about">
                    <div className="section-heading">
                        <p>What the App Does</p>
                        <h3>Built for businesses and freelancers</h3>
                    </div>
                    <p className="section-copy">
                        Invoizor is a web application that helps businesses and freelancers create, organize, and send professional invoices. Users can manage customers, companies, and invoice records from a secure dashboard.
                    </p>
                </section>

                <section className="content-section" id="features">
                    <div className="section-heading">
                        <p>Key Features</p>
                        <h3>Everything needed for invoice workflows</h3>
                    </div>
                    <div className="feature-grid">
                        {features.map((feature) => (
                            <article className="feature-card" key={feature.title}>
                                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                                <h4>{feature.title}</h4>
                                <p>{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="content-section highlight-section" id="privacy">
                    <div className="section-heading">
                        <p>Why Google Access is Required</p>
                        <h3>Only when you choose to connect Gmail</h3>
                    </div>
                    <p className="section-copy emphasis-copy">
                        Invoice Manager requests Google account access only when a user chooses to connect their Gmail account. This permission is used exclusively to send invoices directly from the user's own Gmail account. We do not read, modify, delete, or share the user's emails.
                    </p>
                </section>

                <section className="content-section">
                    <div className="section-heading">
                        <p>How It Works</p>
                        <h3>Simple steps from setup to sending</h3>
                    </div>
                    <ol className="step-list">
                        {steps.map((step, index) => (
                            <li key={step}>
                                <span>{index + 1}</span>
                                <p>{step}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="content-section" id="terms">
                    <div className="section-heading">
                        <p>Security & Privacy</p>
                        <h3>Protection built into the workflow</h3>
                    </div>
                    <div className="privacy-grid">
                        {privacyPoints.map((point) => (
                            <div className="privacy-card" key={point}>
                                <span aria-hidden="true">•</span>
                                <p>{point}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="content-section" aria-labelledby="screenshots-title">
                    <div className="section-heading">
                        <p id="screenshots-title">Screenshots</p>
                        <h3>What the app looks like</h3>
                    </div>
                    <div className="screenshot-grid">
                        {screenshots.map((shot) => (
                            <article className="screenshot-card" key={shot.title}>
                                <div className="screenshot-frame">
                                    <div className="screenshot-browser">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="screenshot-placeholder">
                                        <strong>{shot.title}</strong>
                                        <p>{shot.text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="landing-footer" id="contact">
                <div>
                    <h3>Contact Information</h3>
                    <p>Email: <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
                    <p>Developer: Aarav Mavi</p>
                </div>

                <div className="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="mailto:support@yourdomain.com">Contact Us</a>
                </div>
            </footer>
        </div>
    );
}

export default LandingHome;