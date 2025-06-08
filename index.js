const express = require("express");
const http = require("http");  // <-- new
const socketIO = require("socket.io");  // <-- new
const app = express();
const server = http.createServer(app);  // <-- create HTTP server with Express app
const io = socketIO(server);            // <-- attach socket.io to the server
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user.js");
const Report = require("./models/report.js");
const Auth = require("./models/auth.js");
const multer = require('multer');
const { cloudinary, storage } = require('./cloudinaryConfig.js'); // Adjust path
const upload = multer({ storage });
const sendEmail = require('./emailThing/emailService'); // Adjust path if needed
const { getNewReportEmailTemplate } = require('./emailThing/emailTemplates');
require('dotenv').config();



app.use(express.json()); // to handle JSON body from fetch()
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));

main()
    .then(() => {
        console.log("connection successful");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WaterProblemMapping');
}

// app.listen(3000, () => {
//     console.log("app is listening on port 3000...");
// });

// Use server.listen instead of app.listen
server.listen(3000, () => {
    console.log("app is listening on port 3000...");
  });

// Socket.io connection handler
const authorizedSockets = new Set();

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Identify authorized dashboard clients
    socket.on("authorizeDashboard", () => {
        authorizedSockets.add(socket.id);
        console.log("Authorized dashboard connected:", socket.id);
    });

    socket.on("disconnect", () => {
        authorizedSockets.delete(socket.id);
        console.log("Client disconnected:", socket.id);
    });
});

app.get("/start", (req, res) => {
    res.render("start.ejs");
});

// signup route
app.post("/start", async (req, res) => {
    let {username, email, password} = req.body;
    let newUser = new User({
        username : username,
        email : email,
        password : password
    });
    await newUser.save();
    res.redirect("/start");
})

//login route
app.post("/userHome", async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.send("Wrong credentials: username not found");
        }

        if (user.password !== password) {
            return res.send("Wrong credentials: Incorrect password");
        }

        // Credentials are valid
        res.render("WPMProject2.ejs", { user }); // or any success page
    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});

//Authority login route
app.post("/authHome", async (req, res) => {
    const { username, passKey } = req.body;
    try {
        const user = await Auth.findOne({ username: username });

        if (!user) {
            return res.send("Wrong credentials: username not found");
        }

        if (user.passKey !== passKey) {
            return res.send("Wrong credentials: Incorrect passKey");
        }

        // Credentials are valid
        res.render("AuthorityHome.ejs", { user }); // or any success page
    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});
app.get("/authHome", (req, res) => {
    // You might want to check if the user is authorized (session/cookie/auth check) here
  
    // For now, just render the dashboard page
    res.render("AuthorityHome.ejs", { user: null }); // or pass some user info if available
  });
  

// Save report to MongoDB
app.post("/reports", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            coordinates,
            date,
            userId,
            username
        } = req.body;

        const imageUrl = req.file ? req.file.path : "";

        const report = new Report({
            title,
            description,
            location,
            coordinates: JSON.parse(coordinates),
            imageUrl,
            date,
            userId,
            username,
            likes: 0,
            dislikes: 0
        });

        await report.save();

        authorizedSockets.forEach(socketId => {
            io.to(socketId).emit("newReport", report);
        });
        res.status(201).json({ message: "Report saved successfully" });

        // Find all authorized users
        const authUsers = await Auth.find({});

        // Loop through each authorized user and send email
        for (const auth of authUsers) {
        if (auth.email) {
            try {
            // Generate HTML email content
            const htmlContent = getNewReportEmailTemplate(report);

            // Send email with both plain text and HTML
            await sendEmail(
                auth.email,
                "New Water Issue Report Submitted",
                `A new report titled "${report.title}" has been submitted. Location: ${report.location}, Date: ${report.date}`,
                htmlContent
            );
            console.log(`Email sent to ${auth.email}`);
            } catch (err) {
            console.error(`Failed to send email to ${auth.email}:`, err);
            }
        }
        }

        
    } catch (err) {
        console.error("Error saving report:", err);
        res.status(500).json({ error: "Failed to save report" });
    }
});

// Get all reports (for displaying on load)
app.get("/reports", async (req, res) => {
    const { userId } = req.query;

    try {
        let reports;
        if (userId) {
            // Return reports by specific user
            reports = await Report.find({ userId: userId });
        } else {
            // Return all reports (no filter)
            reports = await Report.find({});
        }
        res.json(reports);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});
// GET /reports/sorted
app.get('/reports/sorted', async (req, res) => {
    try {
      const reports = await Report.find().sort({ date: -1 }); // newest first
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  


// Like report
// app.post('/reports/:id/like', async (req, res) => {
//     try {
//       const report = await Report.findById(req.params.id);
//       if (!report) return res.status(404).json({ error: "Report not found" });
      
//       report.likes += 1;
//       await report.save();
//       res.json({ likes: report.likes, dislikes: report.dislikes });
//     } catch (error) {
//       res.status(500).json({ error: "Server error" });
//     }
//   });
app.post('/reports/:id/like', async (req, res) => {
    try {
        const userId = req.body.userId; // Send this from frontend
        const report = await Report.findById(req.params.id);

        if (!report) return res.status(404).json({ message: 'Report not found' });

        const hasLiked = report.likedBy.includes(userId);
        const hasDisliked = report.dislikedBy.includes(userId);

        if (hasLiked) {
            // Remove like
            report.likes -= 1;
            report.likedBy.pull(userId);
        } else {
            // Add like
            report.likes += 1;
            report.likedBy.push(userId);

            // If user had disliked before, remove that
            if (hasDisliked) {
                report.dislikes -= 1;
                report.dislikedBy.pull(userId);
            }
        }

        await report.save();
        res.status(200).json({ likes: report.likes, dislikes: report.dislikes });

    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  
// dislike report
//   app.post('/reports/:id/dislike', async (req, res) => {
//     try {
//       const report = await Report.findById(req.params.id);
//       if (!report) return res.status(404).json({ error: "Report not found" });
      
//       report.dislikes += 1;
//       await report.save();
//       res.json({ likes: report.likes, dislikes: report.dislikes });
//     } catch (error) {
//       res.status(500).json({ error: "Server error" });
//     }
//   });
app.post('/reports/:id/dislike', async (req, res) => {
    try {
        const userId = req.body.userId;
        const report = await Report.findById(req.params.id);

        if (!report) return res.status(404).json({ message: 'Report not found' });

        const hasDisliked = report.dislikedBy.includes(userId);
        const hasLiked = report.likedBy.includes(userId);

        if (hasDisliked) {
            report.dislikes -= 1;
            report.dislikedBy.pull(userId);
        } else {
            report.dislikes += 1;
            report.dislikedBy.push(userId);

            if (hasLiked) {
                report.likes -= 1;
                report.likedBy.pull(userId);
            }
        }

        await report.save();
        res.status(200).json({ likes: report.likes, dislikes: report.dislikes });

    } catch (err) {
        console.error('Dislike error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  

  // PATCH /reports/:id/status
app.patch('/reports/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(updatedReport);
    } catch (err) {
        console.error('Error updating report status:', err);
        res.status(500).json({ error: 'Failed to update report status' });
    }
});

app.post('/submit-evidence', upload.single('evidenceImage'), async (req, res) => {
    try {
        // Multer parses file, but req.body fields come as strings
        const measuresTaken = req.body.measuresTaken; // Correct field name
        const reportId = req.body.reportId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Evidence image is required.' });
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'evidence_images'
        });

        const afterImageUrl = result.secure_url;

        const updated = await Report.findByIdAndUpdate(
            reportId,
            {
                evidence: {
                    measuresTaken: measuresTaken,  // Fix: assign string value properly
                    afterImageUrl,
                    submittedAt: new Date()
                },
                status: "Resolved"
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Evidence submitted successfully.', report: updated });

    } catch (err) {
        console.error('Error submitting evidence:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/stats', async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'Pending' });
        const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

        res.status(200).json({
            total: totalReports,
            pending: pendingReports,
            resolved: resolvedReports
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



