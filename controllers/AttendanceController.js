

const Attendance = require("../models/Attendance");
// const recordAttendance = async (attendanceData) => {
//     try {
//       const attendance = new Attendance(attendanceData);
//       const savedAttendance = await attendance.save();
//       return savedAttendance;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   };
const recordAttendance = async (req, res) => {
  const { id } = req.params; // Extracting the employee ID from request parameters
  console.log(req.params)
  const attendanceData = req.body; // Extracting attendance data from request body

  try {
      // Ensure checkIn and checkOut are provided
      if (!attendanceData.checkIn || !attendanceData.checkOut) {
          return res.status(400).json({ error: 'Check-in and Check-out times are required' });
      }

      // Calculate totalHours and overtimeHours
      const checkIn = new Date(attendanceData.checkIn);
      const checkOut = new Date(attendanceData.checkOut);
      const duration = (checkOut - checkIn) / (1000 * 60 * 60); // Convert milliseconds to hours
      attendanceData.totalHours = Math.max(0, duration); // Ensure non-negative
      attendanceData.overtimeHours = Math.max(0, duration - 8); // Assuming 8 hours is standard work time

      // Add the employee ID to the attendance data
      attendanceData.employeeId = id; // Assuming your Attendance model has an employeeId field

      // Save the attendance record
      const attendance = new Attendance(attendanceData);
      const savedAttendance = await attendance.save();

      // Return the saved attendance record
      return res.status(201).json(savedAttendance);
  } catch (error) {
      console.error('Error recording attendance:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
  }
};
  

const fetchAttendance = async (req, res) => {
  const employeeId = req.query.employeeId; // Extract employeeId from query parameters
  const startDate = req.query.startDate; // Extract startDate from query parameters
  const endDate = req.query.endDate; // Extract endDate from query parameters
  const page = parseInt(req.query.page, 10) || 1; // Extract page from query parameters, default to 1
  const limit = parseInt(req.query.limit, 10) || 10; // Extract limit from query parameters, default to 10

  try {
      const filters = {};
      if (employeeId) {
          filters.employeeId = employeeId; // Filter by employee
      }
      if (startDate && endDate) {
          filters.date = {
              $gte: new Date(startDate),
              $lte: new Date(endDate), // Filter by date range
          };
      }

      const options = {
          page: page,
          limit: limit,
          populate: 'employeeId', // Include employee details
      };

      const result = await Attendance.paginate(filters, options);
        // If no records found, return an empty array
        if (result.docs.length === 0) {
          return res.status(404).json({ message: 'No attendance records found for this employee.' });
      }
      return res.status(200).json(result); // Return the result as a response
  } catch (error) {
      console.error('Error fetching attendance:', error.message);
      return res.status(500).json({ error: 'Internal server error' }); // Return an error response
  }
};

const fetchAttendanceById = async (req, res) => {
  console.log(req)
  const { employeeId } = req.params; // Extracting the ID from request parameters
  console.log(req.params , 'Here is the params');
  try {
      // Fetch attendance record by ID and populate employee details
      const attendance = await Attendance.find({employeeId}).populate('employeeId'); 
      // Check if attendance record exists
      if (!attendance || attendance.length === 0) {
        return res.status(404).json({ error: 'No attendance records found for this employee' });
      }
  

      // Return the found attendance record
      return res.status(200).json(attendance);
  } catch (error) {
      console.error('Error fetching attendance record:', error.message);
      return res.status(500).json({ error: 'Internal server error' }); // Return an error response
  }
};

const updateAttendance = async (req, res) => {
  const { employeeId } = req.params; // Assuming employeeId is passed as a route parameter
  const updateData = req.body; // Fields to update (e.g., checkIn, checkOut, totalHours)

  console.log(employeeId)
  console.log(updateData)
  try {
    // Validate employeeId and updateData
    if (!employeeId || !updateData) {
      return res.status(400).json({ success: false, message: 'Employee ID and update data are required' });
    }

    // Update attendance record
    const updatedAttendance = await Attendance.findOneAndUpdate(
      { employeeId }, // Filter by employeeId
      { $set: updateData }, // Update with the provided data
      { new: true, runValidators: true } // Return the updated document and apply validations
    );

    // Handle case where no matching record is found
    if (!updatedAttendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found for the specified employee ID' });
    }

    // Success response with the updated attendance
    return res.status(200).json({ success: true, data: updatedAttendance });
  } catch (error) {
    // Error handling
    return res.status(500).json({ success: false, message: error.message });
  }
};
  
      
  const deleteAttendance = async (req,res) => {

    const { employeeId } = req.params; // Extracting the ID from request parameters
    console.log(req.params , 'Here is the params');
    try {
      console.log('Attempting to delete attendance for employeeId:', employeeId);
      const deletedAttendance = await Attendance.findOneAndDelete(employeeId);
      if (!deletedAttendance) {
        throw new Error('Attendance record not found');
      }
      return res.status(200).json({ message: 'Attendance record deleted successfully', deletedAttendance });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  module.exports={
    recordAttendance,
    deleteAttendance,
    updateAttendance,
    fetchAttendance,
    fetchAttendanceById
  }
  