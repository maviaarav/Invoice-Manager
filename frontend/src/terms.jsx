import React from "react";

export default function Terms() {

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
      background:#f6f8fc;
      }

      .terms{

      min-height:100vh;
      display:flex;
      justify-content:center;
      padding:60px 20px;
      background:linear-gradient(140deg,#eef5ff,#ffffff);

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

      color:#1d4ed8;
      font-size:44px;
      margin-bottom:10px;

      }

      h2{

      margin-top:35px;
      margin-bottom:15px;
      color:#111827;
      }

      p{

      color:#4b5563;
      line-height:1.8;
      margin-bottom:16px;
      font-size:17px;

      }

      ul{

      margin-left:22px;
      color:#4b5563;
      line-height:2;

      }

      .footer{

      margin-top:45px;
      border-top:1px solid #e5e7eb;
      padding-top:25px;
      color:#6b7280;

      }

      a{

      color:#2563eb;
      text-decoration:none;
      font-weight:600;

      }

      `}</style>

      <div className="terms">

        <div className="card">

          <h1>Terms & Conditions</h1>

          <p>
            Welcome to Invoice Manager. By using our application you agree to
            the following terms.
          </p>

          <h2>Use of Service</h2>

          <p>
            Invoice Manager allows users to create, manage and send invoices
            using their own Google account.
          </p>

          <h2>User Responsibilities</h2>

          <ul>

            <li>Provide accurate information.</li>

            <li>Use the application lawfully.</li>

            <li>Maintain the security of your account.</li>

            <li>Do not misuse Google's services.</li>

          </ul>

          <h2>Google Integration</h2>

          <p>
            Invoice Manager accesses your Google account only after your
            authorization through Google's OAuth system.
          </p>

          <p>
            You may revoke access at any time through your Google Account
            settings.
          </p>

          <h2>Data Ownership</h2>

          <p>
            All invoices and documents created within the application remain
            your property.
          </p>

          <h2>Limitation of Liability</h2>

          <p>
            Invoice Manager is provided "as is" without warranties of any kind.
            We are not responsible for any losses resulting from misuse,
            downtime, or third-party service interruptions.
          </p>

          <h2>Termination</h2>

          <p>
            We reserve the right to suspend accounts involved in abuse,
            fraudulent activity, or violations of these Terms.
          </p>

          <h2>Contact</h2>

          <p>

            Questions regarding these Terms may be sent to

            <br /><br />

            <a href="mailto:maviaarav29@gmail.com">
              maviaarav29@gmail.com
            </a>

          </p>

          <div className="footer">

            © 2026 Invoice Manager

          </div>

        </div>

      </div>

    </>

  );

}