const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const { Schema } = mongoose;

// Define the Employee Schema
const employeeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name cannot be empty'],
      minlength: [1, 'Name length must be between 1 and 255 characters'],
      maxlength: [255, 'Name length must be between 1 and 255 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation cannot be empty'],
      minlength: [1, 'Designation length must be between 1 and 255 characters'],
      maxlength: [255, 'Designation length must be between 1 and 255 characters'],
    },
    contact: {
      type: String, // Use String to support phone numbers with "+" or special characters
      required: false,
      minlength: [1, 'Contact length must be between 1 and 15 characters'],
      maxlength: [15, 'Contact length must be between 1 and 15 characters'],
    },
    hourly_rate: {
      type: Number,
      required: false,
      min: [0, 'Hourly rate cannot be negative'],
    },
    advance_pay: {
      type: Number,
      required: false,
      min: [0, 'Advance pay cannot be negative'],
    },
    address: {
      type: String,
      required: false,
      minlength: [1, 'Address length must be between 1 and 255 characters'],
      maxlength: [255, 'Address length must be between 1 and 255 characters'],
    },
    identityCard: {
      type: String, // URL or file path to the image
      required: false,
    },
    join_date: {
      type: Date,
      required: [true, 'Join date cannot be empty'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add pagination plugin
employeeSchema.plugin(aggregatePaginate);

// Export the Employee model
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
