const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');


const attendanceSchema = new Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Reference to Employee model
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out time is required'],
    },
    totalHours: {
      type: Number,
      required: true,
      default: 0, // Automatically calculated
      min: [0, 'Total hours cannot be negative'],
    },
    overtimeHours: {
      type: Number,
      required: false,
      default: 0, // Automatically calculated
      min: [0, 'Overtime hours cannot be negative'],
    },
  },
  { timestamps: true }
);

attendanceSchema.plugin(mongoosePaginate); // Add the pagination plugin
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
