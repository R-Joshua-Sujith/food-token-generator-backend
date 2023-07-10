const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const UserModel = require("./models/User");
const TokenModel = require("./models/Token")

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection successsful"))
    .catch((err) => console.log(err));

app.post("/create", async (req, res) => {
    const employeeId = req.body.employeeId;
    const user = await UserModel.findOne({ employeeId });
    if (user) {
        return res.status(404).json({ message: 'Employee with this ID Already exists' });
    }

    const newUser = new UserModel({
        employeeId: req.body.employeeId,
        employeeName: req.body.employeeName,
    });

    try {
        const savedUser = await newUser.save();
        res.status(200).json({ message: `Emolyee Added Successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to Add Employee' });
    }
})

app.get('/', (req, res) => {
    res.send("Food Token Generator Backend")
})

app.get('/getUsers', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/getToken', async (req, res) => {
    try {
        const token = await TokenModel.find();
        res.json(token);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


app.delete('/deleteUser/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await UserModel.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to Delete' });
    }
});

app.post('/token', async (req, res) => {
    try {
        const employeeId = req.body.employeeId;
        const user = await UserModel.findOne({ employeeId });
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if the employee already has a token for the day
        const existingToken = await TokenModel.findOne({
            employeeId,
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }, // Check tokens created today
        });

        if (existingToken) {
            return res.status(400).json({ message: 'Employee has already received a token today' });
        }

        // Generate a new token
        const newToken = new TokenModel({
            employeeId,
            createdAt: new Date(),
        });

        // Save the token to the database
        await newToken.save();

        // Return the generated token in the response
        res.status(200).json({ employeeId: user.employeeId, employeeName: user.employeeName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate token' });
    }
});

app.get('/getStats', async (req, res) => {
    try {

        const pipeline = [
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.month': 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            {
                                $let: {
                                    vars: {
                                        monthsInString: [
                                            '',
                                            'January',
                                            'February',
                                            'March',
                                            'April',
                                            'May',
                                            'June',
                                            'July',
                                            'August',
                                            'September',
                                            'October',
                                            'November',
                                            'December'
                                        ]
                                    },
                                    in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
                                }
                            },
                        ],
                    },
                    count: 1,
                },
            },
        ];

        const result = await TokenModel.aggregate(pipeline);

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to retrieve token counts by month', error);
    }
});

app.listen(5000, () => {
    console.log("Backend Server is Running Successfully");
})