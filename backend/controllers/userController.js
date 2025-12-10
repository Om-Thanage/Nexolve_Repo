const User = require('../models/user');

const userController = {
    createUser: async (req, res) => {
        try {
            const { clerkId, name, email, phone, profilePhoto, role } = req.body;

            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(200).json({ message: 'User already exists', user });
            }

            user = new User({
                clerkId,
                name,
                email,
                phone,
                profilePhoto,
                role
            });

            await user.save();
            res.status(201).json({ message: 'User created successfully', user });
        } catch (error) {
            console.error('Create User Error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getUserProfile: async (req, res) => {
        try {
            const { clerkId } = req.params;
            const user = await User.findOne({ clerkId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getName: async (req, res) => {
        try {
            const { _id } = req.params;
            const user = await User.findOne({ _id });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ name: user.name });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    updatePreferences: async (req, res) => {
        try {
            const { clerkId } = req.params;
            const { preferences, notificationSettings } = req.body;

            const user = await User.findOneAndUpdate(
                { clerkId },
                { $set: { preferences, notificationSettings } },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'Preferences updated', user });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = userController;
