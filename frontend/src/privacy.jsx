import React from "react";

export default function PrivacyPolicy() {
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

        .privacy{
          min-height:100vh;
          background:linear-gradient(135deg,#eef4ff,#f9fbff);
          display:flex;
          justify-content:center;
          padding:60px 20px;
        }

        .card{
          width:100%;
          max-width:1050px;
          background:white;
          border-radius:24px;
          padding:50px;
          box-shadow:0 25px 70px rgba(0,0,0,.08);
        }

        h1{
          font-size:44px;
          color:#1d4ed8;
          margin-bottom:8px;
        }

        .date{
          color:#6b7280;
          margin-bottom:40px;
        }

        h2{
          color:#111827;
          margin-top:35px;
          margin-bottom:15px;
          font-size:26px;
        }

        p{
          color:#4b5563;
          line-height:1.8;
          margin-bottom:15px;
          font-size:17px;
        }

        ul{
          margin-left:22px;
          color:#4b5563;
          line-height:2;
        }

        .footer{
          margin-top:50px;
          border-top:1px solid #e5e7eb;
          padding-top:30px;
          color:#6b7280;
        }

        a{
          color:#2563eb;
          text-decoration:none;
          font-weight:600;
        }

      `}</style>

      <div className="privacy">

        <div className="card">

          <h1>Privacy Policy</h1>

          <div className="date">
            Effective Date: July 2026
          </div>

          <p>
            Invoice Manager values your privacy and is committed to protecting
            your personal information. This Privacy Policy explains what
            information we collect, how it is used, and how it is protected.
          </p>

          <h2>Information We Collect</h2>

          <ul>
            <li>Name</li>
            <li>Email Address</li>
            <li>Google Account Information</li>
            <li>Profile Picture</li>
            <li>Invoice Information created by you</li>
            <li>Gmail OAuth tokens (securely stored)</li>
          </ul>

          <h2>How We Use Your Information</h2>

          <p>
            Your Google account is used solely to authenticate your identity and
            allow Invoice Manager to send invoices from your Gmail account with
            your permission.
          </p>

          <p>
            We never access your personal emails for advertising, marketing or
            profiling purposes.
          </p>

          <h2>Google User Data</h2>

          <p>
            Invoice Manager only requests access that is necessary to provide
            invoice emailing functionality.
          </p>

          <p>
            Google user data is never sold, rented, or shared with third
            parties.
          </p>

          <h2>Data Security</h2>

          <p>
            We use industry-standard security measures to protect your
            information. OAuth tokens are securely stored and only used to
            perform actions that you explicitly authorize.
          </p>

          <h2>Data Retention</h2>

          <p>
            Your information remains stored while your account exists. You may
            request deletion of your account and associated data at any time.
          </p>

          <h2>Your Rights</h2>

          <ul>
            <li>Disconnect your Google Account anytime.</li>
            <li>Delete your account.</li>
            <li>Request removal of your stored data.</li>
          </ul>

          <h2>Contact</h2>

          <p>
            For any privacy related questions please contact us at
            <br /><br />
            <a href="mailto:maviaarav29@gmail.com">
              maviaarav29@gmail.com
            </a>
          </p>

          <div className="footer">
            © 2026 Invoice Manager. All Rights Reserved.
          </div>

        </div>

      </div>

    </>
  );
}
