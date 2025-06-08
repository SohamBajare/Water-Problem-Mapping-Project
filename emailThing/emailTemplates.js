// function getNewReportEmailTemplate(report) {
//     return `
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
//         <h2 style="color: #0077cc;">New Water Issue Report Submitted</h2>
//         <p>Hello,</p>
//         <p>A new report has been submitted with these details:</p>
//         <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${report.title}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Location</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${report.location || 'Unknown'}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Date</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${report.date}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Description</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${report.description || 'No description provided'}</td>
//           </tr>
//         </table>
//         <p>Please check the dashboard for more details.</p>
//         <p>Thanks,<br/>Water Problem Mapping Team</p>
//       </div>
//     `;
//   }
  
//   module.exports = { getNewReportEmailTemplate };
  
function getNewReportEmailTemplate(report) {
  return `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      color: #2c3e50; 
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
      background: linear-gradient(135deg, #e3f2fd 0%, #f8fdff 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 119, 204, 0.1);
    ">
      <!-- Header Section -->
      <div style="
        background: linear-gradient(135deg, #0077cc 0%, #005a9e 100%);
        padding: 30px 40px;
        text-align: center;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(30px, -30px);
        "></div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          transform: translate(-20px, 20px);
        "></div>
        <h1 style="
          color: white; 
          margin: 0; 
          font-size: 28px;
          font-weight: 300;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
        ">💧 New Water Issue Report</h1>
        <p style="
          color: rgba(255, 255, 255, 0.9);
          margin: 8px 0 0 0;
          font-size: 16px;
          position: relative;
          z-index: 1;
        ">Community Water Monitoring System</p>
      </div>

      <!-- Content Section -->
      <div style="padding: 40px;">
        <p style="
          font-size: 16px;
          margin-bottom: 30px;
          color: #34495e;
        ">Hello,</p>
        
        <p style="
          font-size: 16px;
          margin-bottom: 30px;
          color: #34495e;
        ">A new water issue report has been submitted to our monitoring system. Please review the details below:</p>
        
        <!-- Report Details Card -->
        <div style="
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 15px rgba(0, 119, 204, 0.08);
          overflow: hidden;
          margin-bottom: 30px;
          border-left: 4px solid #0077cc;
        ">
          <table style="
            border-collapse: collapse; 
            width: 100%;
          ">
            <tr style="background: #f8fdff;">
              <td style="
                padding: 20px;
                font-weight: 600;
                color: #0077cc;
                width: 30%;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">📋 Title</td>
              <td style="
                padding: 20px;
                color: #2c3e50;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">${report.title}</td>
            </tr>
            <tr>
              <td style="
                padding: 20px;
                font-weight: 600;
                color: #0077cc;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">📍 Location</td>
              <td style="
                padding: 20px;
                color: #2c3e50;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">${report.location || '<em style="color: #7f8c8d;">Location not specified</em>'}</td>
            </tr>
            <tr style="background: #f8fdff;">
              <td style="
                padding: 20px;
                font-weight: 600;
                color: #0077cc;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">📅 Date Reported</td>
              <td style="
                padding: 20px;
                color: #2c3e50;
                font-size: 15px;
                border-bottom: 1px solid #e8f4fd;
              ">${report.date}</td>
            </tr>
            <tr>
              <td style="
                padding: 20px;
                font-weight: 600;
                color: #0077cc;
                font-size: 15px;
                vertical-align: top;
              ">📝 Description</td>
              <td style="
                padding: 20px;
                color: #2c3e50;
                font-size: 15px;
                line-height: 1.6;
              ">${report.description || '<em style="color: #7f8c8d;">No description provided</em>'}</td>
            </tr>
          </table>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="http://localhost:3000/authHome" style="
            display: inline-block;
            background: linear-gradient(135deg, #0077cc 0%, #005a9e 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0, 119, 204, 0.3);
            transition: all 0.3s ease;
          ">🔍 View Full Report Dashboard</a>
        </div>

        <div style="
          background: linear-gradient(135deg, #e8f6ff 0%, #f0f9ff 100%);
          border: 1px solid #b3e0ff;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        ">
          <p style="
            margin: 0;
            color: #0077cc;
            font-size: 14px;
            text-align: center;
          ">💡 <strong>Quick Action Required:</strong> Please review this report and take appropriate action through the dashboard.</p>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
        padding: 25px 40px;
        text-align: center;
      ">
        <p style="
          color: white;
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
        ">Best regards,<br/>
        <strong>Water Problem Mapping Team</strong></p>
        <p style="
          color: rgba(255, 255, 255, 0.7);
          margin: 15px 0 0 0;
          font-size: 14px;
        ">🌊 Protecting our water resources, one report at a time</p>
      </div>
    </div>
  `;
}

module.exports = { getNewReportEmailTemplate };